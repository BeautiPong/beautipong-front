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
			<div id="scoreboard">
				<div class="scoreboard__userinfo">
					<span class="player_nickname" id="player1_nickname">player1</span>
					<span class="player_score" id="player1_score">0</span>
				</div>
				<span> : </span>
				<div class="scoreboard__userinfo">
					<span class="player_score" id="player2_score">0</span>
					<span class="player_nickname" id="player2_nickname">player2</span>
				</div>
			</div>
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
		
		const gameinfo = {
			tableWidth: 3.5,
			tableHeigth: 0.1,
			tableDepth: 4.5,
			paddleWidth:0.5,
			paddleHeight:0.1,
			paddleDepth: 0.1,
		}

		this.initGame(gameinfo); // 게임 초기화 메서드 호출
		this.connectWebSocket(roomName, jwtToken, gameinfo); // WebSocket 연결 설정
	}

    // 게임을 초기화하는 메서드
    initGame(gameinfo) {
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas });

        // 화면 크기에 맞게 설정
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x9CD3E7);

		// 조명 추가
		const ambientLight = new THREE.AmbientLight(0x404040);  // 부드러운 환경광 추가
		this.scene.add(ambientLight);
	
		const light = new THREE.DirectionalLight(0xffffff, 1.2);  // 강한 직사광 조명 추가
		light.position.set(0, 4, -4);  // 조명 위치를 조정하여 테이블 위로 내려오게 설정
		this.scene.add(light);
        
        // 카메라 설정
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, -4);
        this.camera.lookAt(0, 0, 0);

        // 테이블, 패들, 공을 초기화
        this.initTable(gameinfo);
        this.initPaddles(gameinfo);
        this.initBall();
		this.isitNet(gameinfo);

        // 애니메이션 루프 시작
        this.animate();
    }

    // 테이블 초기화
    initTable(gameinfo) {
		const { tableWidth, tableHeigth, tableDepth } = gameinfo;
        const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeigth, tableDepth);
        const tableMaterial = new THREE.MeshBasicMaterial({ color: 0x6ED087 });

        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = -(tableHeigth / 2);
        this.scene.add(this.table);

		// 테두리 생성 (각 모서리)
		const borderThickness = 0.02; // 테두리 두께

		// 각 모서리에 테두리 추가
		const borderMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF }); // 흰색 테두리
	
		// 앞쪽 테두리
		const frontBorderGeometry = new THREE.BoxGeometry(tableWidth + borderThickness * 2, tableHeigth, borderThickness);
		const frontBorder = new THREE.Mesh(frontBorderGeometry, borderMaterial);
		frontBorder.position.set(0, -(tableHeigth / 2), -(tableDepth / 2) - borderThickness); // 앞쪽
		this.scene.add(frontBorder);
	
		// 뒤쪽 테두리
		const backBorderGeometry = new THREE.BoxGeometry(tableWidth + borderThickness * 2, tableHeigth, borderThickness);
		const backBorder = new THREE.Mesh(backBorderGeometry, borderMaterial);
		backBorder.position.set(0, -(tableHeigth / 2), (tableDepth / 2) + borderThickness); // 뒤쪽
		this.scene.add(backBorder);
	
		// 왼쪽 테두리
		const leftBorderGeometry = new THREE.BoxGeometry(borderThickness, tableHeigth, tableDepth + borderThickness * 2);
		const leftBorder = new THREE.Mesh(leftBorderGeometry, borderMaterial);
		leftBorder.position.set(-(tableWidth / 2) - borderThickness / 2, -(tableHeigth / 2), 0); // 왼쪽
		this.scene.add(leftBorder);
	
		// 오른쪽 테두리
		const rightBorderGeometry = new THREE.BoxGeometry(borderThickness, tableHeigth, tableDepth + borderThickness * 2);
		const rightBorder = new THREE.Mesh(rightBorderGeometry, borderMaterial);
		rightBorder.position.set((tableWidth / 2) + borderThickness / 2, -(tableHeigth / 2), 0); // 오른쪽
		this.scene.add(rightBorder);
    }

    // 패들 초기화
    initPaddles(gameinfo) {
		const { paddleWidth, paddleHeight, paddleDepth, tableHeigth, tableDepth} = gameinfo;
        const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xFF897D });
        this.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.paddle.position.set(0, (tableHeigth / 2), -(tableDepth / 2) + (paddleDepth / 2));
        this.scene.add(this.paddle);

        this.opponentPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        this.opponentPaddle.position.set(0, (tableHeigth / 2), (tableDepth / 2) - (paddleDepth / 2));
        this.scene.add(this.opponentPaddle);
    }

    // 공 초기화
    initBall() {
        const ballGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.y = 0.1;
        this.scene.add(this.ball);
    }

	isitNet(gameinfo) {
		// 네트 생성
		const netHeight = 0.2;  // 네트의 높이
		const netWidth = gameinfo.tableWidth;
		const netLength = 0.02; // 테이블 깊이를 사용
	
		const netColor = 0xC5ECCF;  // 네트 색상
	
		// 네트의 geometry와 material 설정
		const netGeometry = new THREE.BoxGeometry(netWidth, netHeight, netLength);
		const netMaterial = new THREE.MeshPhongMaterial({ color: netColor, side: THREE.DoubleSide }); // 양면에서 네트를 볼 수 있도록 설정
		this.net = new THREE.Mesh(netGeometry, netMaterial);
	
		// 네트 위치 설정
		this.net.position.set(0, 0, 0);
		this.scene.add(this.net); // this.net로 수정
	}	

    // 애니메이션 루프를 담당하는 메서드
    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    connectWebSocket(roomName, jwtToken, gameinfo) {
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
				this.playerRole = data.role;
			} else if (data.type === 'game_state') {
				this.updateGameState(data, gameinfo);

				document.getElementById('player1_nickname').textContent = data.player1;
				document.getElementById('player2_nickname').textContent = data.player2;
				document.getElementById('player1_score').textContent = data.scores.player1;
				document.getElementById('player2_score').textContent = data.scores.player2;

			} else if (data.type === 'game_over') {
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
			document.querySelector('.nav-container').style.display = 'block';
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
    updateGameState(data, gameinfo) {
		const { paddleDepth, tableHeigth, tableDepth} = gameinfo;
        let ballZPosition = data.ball_position.z;
        if (this.playerRole === 'player2') {
            ballZPosition = -ballZPosition;
        }
        this.ball.position.set(data.ball_position.x, 0.1, ballZPosition);

        if (this.playerRole === 'player1') {
            this.paddle.position.set(data.paddle_positions.player1, (tableHeigth / 2), -(tableDepth / 2) + (paddleDepth / 2));
            this.opponentPaddle.position.set(data.paddle_positions.player2, (tableHeigth / 2), (tableDepth / 2) - (paddleDepth / 2));
        } else if (this.playerRole === 'player2') {
            this.paddle.position.set(data.paddle_positions.player2, (tableHeigth / 2), -(tableDepth / 2) + (paddleDepth / 2));
            this.opponentPaddle.position.set(data.paddle_positions.player1, (tableHeigth / 2), (tableDepth / 2) - (paddleDepth / 2));
        }
    }
}