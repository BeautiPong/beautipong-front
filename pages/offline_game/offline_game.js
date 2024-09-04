export default class offlineGamePage {
    render() {
        return `
            <div class="offline_game">
                <div class="offline_game">
                    <div id="scoreboard">
                        <div id="player1_score"></div>
                        <div id="player2_score"></div>
                    </div>            
                </div>
            </div>
        `;
    }


    afterRender() {

    console.log("offline_game.js");
    // Django 템플릿에서 전달된 정보를 JavaScript로 가져오기
    const token = localStorage.getItem("access_token");
    const user1 = JSON.parse(document.getElementById('user1').textContent);
    // const user2 = JSON.parse(document.getElementById('user2').textContent);
    // const user3 = JSON.parse(document.getElementById('user3').textContent);
    // const user4 = JSON.parse(document.getElementById('user4').textContent);
    const matchType = "{{ match_type }}";
    console.log("matchType: ", matchType);
    let socketUrl;
    if (matchType === '1v1') {
        socketUrl = 'ws://' + window.location.host + '/ws/game/offline/' + user1 + '/' + user2 + '/?token=' + token;
    } else if (matchType === 'tournament') {
        socketUrl = 'ws://' + window.location.host + '/ws/game/offline/' + user1 + '/' + user2 + '/' + user3 + '/' + user4 + '/?token=' + token;
    }

    let socket = new WebSocket(socketUrl);

    // 서버로부터 받아온 테이블, 패들 정보
    const tableWidth = 100;
    const tableLength = 50;
    const paddleWidth = 10;

    // Three.js 기본 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 탁구대 생성
    const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableLength);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.rotation.x = -Math.PI / 2;  // 테이블이 바닥에 놓이도록 설정
    table.position.y = 0;  // 테이블의 높이를 약간 조정
    scene.add(table);

    // 공 생성
    const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 1, 0);
    scene.add(ball);

    // 패들 생성
    const paddleGeometry = new THREE.BoxGeometry(10, 1, paddleWidth);  // 패들의 크기 설정
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });  // 패들 색상: 파란색

    const player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    player1Paddle.position.set(-tableWidth / 2 + 5, 0.5, 0);  // player1 패들의 x 위치를 왼쪽 끝에 고정
    scene.add(player1Paddle);

    const player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    player2Paddle.position.set(tableWidth / 2 - 5, 0.5, 0);  // player2 패들의 x 위치를 오른쪽 끝에 고정
    scene.add(player2Paddle);

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0x404040);  // 부드러운 환경광 추가
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);  // 강한 직사광 조명 추가
    light.position.set(0, 100, 100);  // 조명 위치를 조정하여 테이블 위로 내려오게 설정
    scene.add(light);

    // 카메라 설정
    camera.position.set(0, 50, 50);  // 카메라를 테이블 위쪽에 배치
    camera.lookAt(0, 0, 0);  // 카메라가 테이블 중심을 바라보게 설정

    // 애니메이션 렌더링
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'game_loop') {
            const ball_position = data.state.ball_pos;
            const player1_paddle_z = data.state.player1_paddle_z;
            const player2_paddle_z = data.state.player2_paddle_z;

            // 공의 위치 업데이트
            ball.position.x = ball_position[0];
            ball.position.z = ball_position[1];

            // 패들의 위치 업데이트
            player1Paddle.position.z = player1_paddle_z;
            player2Paddle.position.z = player2_paddle_z;

            // 점수 업데이트
            document.getElementById('player1_score').textContent = `${data.state.player1}: ${data.state.player1_score}`;
            document.getElementById('player2_score').textContent = `${data.state.player2}: ${data.state.player2_score}`;
        }

        else if (data.type === 'game_end') {
            alert('Game Over - ' + data.winner + ' wins!');
        }
    };

    socket.onopen = function() {
        console.log("WebSocket connection opened");
    };

    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
    };

    socket.onerror = function(event) {
        console.error("WebSocket error occurred:", event);
    };

    const keysPressed = {};
    const validKeys = ['w', 's', 'o', 'l'];

    document.addEventListener('keydown', (event) => {
        if (validKeys.includes(event.key)) {
            // console.log(event.key);
            keysPressed[event.key] = true;
            handleKeyPresses();
        }
    });

    document.addEventListener('keyup', (event) => {
        if (validKeys.includes(event.key)) {
            delete keysPressed[event.key];
        }
    });

    function handleKeyPresses() {
        for (let key in keysPressed) {
            if (keysPressed[key]) {
                socket.send(JSON.stringify({
                    key: key
                }));
            }
        }
    }
}
}