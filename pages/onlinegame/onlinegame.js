import { getRouter } from '../../js/router.js';
import { setGameWebSocket } from './../../assets/components/nav/nav.js';
import {createModal} from '../../assets/components/modal/modal.js';
import {SERVER_IP} from "../../js/index.js";

export default class OnlineGamePage {
    constructor() {
        this.socket = null; // WebSocket 인스턴스를 저장할 변수
    }

    // 페이지를 렌더링하는 메서드
    render() {
        return `
            <div class="game-div">
                <div class="game-container">
                    <canvas id="gameCanvas"></canvas>
                </div>
            </div>
        `;
    }

    // WebSocket 연결을 설정하고 게임 초기화를 담당하는 메서드
    async afterRender(roomName, jwtToken) {
	
		if (!roomName || !jwtToken) {
			console.error('Room name or JWT token is missing');
			return;
		}

		this.initGame(); // 게임 초기화 메서드 호출
		this.connectWebSocket(roomName, jwtToken); // WebSocket 연결 설정
	}

    // 게임을 초기화하는 메서드
    initGame() {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas });

        // 화면 크기에 맞게 설정
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        
        this.scene = new THREE.Scene();
        
        // 카메라 설정
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 3, -5);
        this.camera.lookAt(0, 0, 0);

        // 테이블, 패들, 공을 초기화
        this.initTable();
        this.initPaddles();
        this.initBall();

        // 애니메이션 루프 시작
        this.animate();
    }

    // 테이블 초기화
    initTable() {
        const tableGeometry = new THREE.BoxGeometry(2, 0.1, 4);
        const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = -0.05;
        this.scene.add(this.table);
    }

    // 패들 초기화
    initPaddles() {
        const paddleGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.1);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.paddle.position.set(0, 0.05, -1.8);
        this.scene.add(this.paddle);

        this.opponentPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.opponentPaddle.position.set(0, 0.05, 1.8);
        this.scene.add(this.opponentPaddle);
    }

    // 공 초기화
    initBall() {
        const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.y = 0.1;
        this.scene.add(this.ball);
    }

    // 애니메이션 루프를 담당하는 메서드
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    connectWebSocket(roomName, jwtToken) {
		const socketUrl = `wss://${SERVER_IP}/ws/game/online/${roomName}/?token=${jwtToken}`;
	
		// 기존 WebSocket이 존재하고, 아직 닫히지 않았다면 종료
		if (this.socket) {
			if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
				this.socket.close();
				setGameWebSocket(null);
			}
		}
	
		// 새로운 WebSocket 연결 생성
		this.socket = new WebSocket(socketUrl);
		setGameWebSocket(this.socket);
	
		this.socket.onopen = () => {
			console.log("게임 WebSocket 연결 성공");
		};
	
		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
	
			// 서버에서 받은 데이터를 처리
			if (data.type === 'assign_role') {
				console.log("서버로부터 받은 데이터:", data);
				this.playerRole = data.role;
			} else if (data.type === 'game_state') {
				this.updateGameState(data);
			} else if (data.type === 'game_over') {
				console.log(data);
				const winner = data.winner;  // 게임 승자
				const player1 = data.player1;
				const player2 = data.player2;
				const player1Score = data.scores.player1;
				const player2Score = data.scores.player2;

				let yourScore = 0;
				let opponentScore = 0;
				let rankPoint = 0;

				if (this.playerRole === 'player1') {
					this.userNickname = data.player1;
					yourScore = player1Score;
					opponentScore = player2Score;
					rankPoint = data.player1_score;
				} else if (this.playerRole === 'player2') {
					this.userNickname = data.player2;
					yourScore = player2Score;
					opponentScore = player1Score;
					rankPoint = data.player2_score;
				}

				const isWinner = (winner === this.userNickname);

				const message = isWinner
					? `${yourScore} : ${opponentScore} 로 승리하셨군요! 축하드립니다 :)`
					: `${yourScore} : ${opponentScore} 로 패배하셨군요! 좀 더 노력하세요 :(`;

				const icon = isWinner ? 'winer' : 'lose';

				this.showModal(message, '확인', icon);

				this.socket.close();
			}
		};
	
		this.socket.onclose = () => {
			console.log("게임 WebSocket 연결 종료");
			// alert("게임이 종료되었습니다. 대기실로 돌아갑니다.");
			this.disconnectWebSocket(); // 명확히 연결 종료
			const router = getRouter();
			if (router) {
				router.navigate('/');
			} else {
				console.error('Router not found!');
			}
		};
	
		this.socket.onerror = (error) => {
			console.error("WebSocket 오류 발생:", error);
		};
	
		// 이벤트 핸들러 등록 (한번만 실행되게)
		if (!this.isEventListenerSet) {
			document.addEventListener('keydown', (event) => this.handleKeyPress(event));
			this.isEventListenerSet = true; // 이벤트 핸들러가 한 번만 등록되도록 설정
		}
	}
	
	// WebSocket 연결을 명확히 종료하는 메서드
	disconnectWebSocket() {
		if (this.socket) {
			if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
				this.socket.close(); // WebSocket 연결 종료
				setGameWebSocket(null);
			}
			this.socket = null;  // WebSocket 객체를 명확히 null로 설정
			setGameWebSocket(null);
		}
	}

	// 모달 창 생성 및 표시 함수
	showModal(message, buttonMsg, icon) {
		// 모달 컴포넌트 불러오기
		const modalHTML = createModal(message, buttonMsg, icon);

		// 새 div 요소를 생성하여 모달을 페이지에 추가
		const modalDiv = document.createElement('div');
		modalDiv.innerHTML = modalHTML;
		document.body.appendChild(modalDiv);

		// 닫기 버튼에 이벤트 리스너 추가
		const closeBtn = modalDiv.querySelector('.close');
		closeBtn.onclick = function() {
			modalDiv.remove();
		};

		// 확인 버튼에 이벤트 리스너 추가
		const confirmBtn = modalDiv.querySelector('.modal-confirm-btn');
		confirmBtn.onclick = function() {
			modalDiv.remove();
		};

		// 모달 밖을 클릭했을 때 모달을 닫는 이벤트 리스너 추가
		window.onclick = function(event) {
			if (event.target == modalDiv.querySelector('.modal')) {
				modalDiv.remove();
			}
		};
	}

	// 키 입력을 처리하는 메서드
	handleKeyPress(event) {
		let direction = null;
	
		if (event.code === 'KeyA') {
			direction = 'left';
		} else if (event.code === 'KeyD') {
			direction = 'right';
		}
	
		// WebSocket 연결이 아직 열려 있는지 확인 후 메시지 전송
		if (direction && this.playerRole && this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify({
				type: 'move',
				direction: direction,
				player: this.playerRole  // 자신의 역할을 명시
			}));
		}
	}

    // 게임 상태를 업데이트하는 메서드
    updateGameState(data) {
        let ballZPosition = data.ball_position.z;
        if (this.playerRole === 'player2') {
            ballZPosition = -ballZPosition;
        }
        this.ball.position.set(data.ball_position.x, 0.1, ballZPosition);

        if (this.playerRole === 'player1') {
            this.paddle.position.set(data.paddle_positions.player1, 0.05, -1.8);
            this.opponentPaddle.position.set(data.paddle_positions.player2, 0.05, 1.8);
        } else if (this.playerRole === 'player2') {
            this.paddle.position.set(data.paddle_positions.player2, 0.05, -1.8);
            this.opponentPaddle.position.set(data.paddle_positions.player1, 0.05, 1.8);
        }
    }
}