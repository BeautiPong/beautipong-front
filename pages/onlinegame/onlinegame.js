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
		console.log('Room Name:', roomName);  // Debugging 추가
		console.log('JWT Token:', jwtToken);  // Debugging 추가
	
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

    // WebSocket 연결을 설정하는 메서드
    connectWebSocket(roomName, jwtToken) {
        const socketUrl = `ws://localhost:8000/ws/game/online/${roomName}/?token=${jwtToken}`;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => {
            console.log("WebSocket 연결 성공");
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("서버로부터 받은 데이터:", data);

            // 서버에서 받은 데이터를 처리
            if (data.type === 'assign_role') {
                this.playerRole = data.role;
            } else if (data.type === 'game_state') {
                this.updateGameState(data);
            } else if (data.type === 'game_over') {
                alert(`Game Over! Winner: ${data.winner}`);
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket 연결 종료");
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket 오류 발생:", error);
        };

        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }

    // 키 입력을 처리하는 메서드
    handleKeyPress(event) {
        let direction = null;

        if (event.code === 'KeyA') {
            direction = 'left';
        } else if (event.code === 'KeyD') {
            direction = 'right';
        }

        if (direction && this.playerRole) {
            this.socket.send(JSON.stringify({
                type: 'move',
                direction: direction,
                player: this.playerRole
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