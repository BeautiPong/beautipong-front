import('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')

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



    async afterRender() {

    console.log("offline_game.js");
    // Django 템플릿에서 전달된 정보를 JavaScript로 가져오기
    const token = localStorage.getItem("access_token");
    console.log("token: ", token);
    const urlParams = new URLSearchParams(window.location.search);
    const user1 = urlParams.get('player1') || 'user1';
    const user2 = urlParams.get('player2') || 'user2';
    const user3 = urlParams.get('player3') || 'user3';
    const user4 = urlParams.get('player4') || 'user4';
    console.log("user3: ", user3);
    console.log("user4: ", user4);
    // WebSocket 연결이나 게임 로직에서 user1, user2 사용
    let matchType = "";
    let socket = null
    await fetchUserInfo();


    async function fetchUserInfo() {
        console.log("in fetchUserInfo");
        const formData = {
            "user1" : user1,
            "user2" : user2,
            "user3" : user3,
            "user4" : user4
        };
    try {
        console.log("in try");
        // 백엔드로 POST 요청을 보냅니다.
        const response = await fetch('http://localhost:8000/api/game/offline/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        // 응답 처리
        if (response.ok) {
            const data = await response.json();
            matchType = data.match_type;
            console.log("matchType: ", matchType);
            console.log('POST 요청 성공!');
        } else {
            const errorData = await response.json();
            console.error('response 오류 발생:', errorData);
        }
    } catch (error) {
        console.error('POST 요청 중 오류 발생:', error);
    }
}
    let socketUrl;
    console.log("matchType: ", matchType);
    if (matchType === '1v1') {
        console.log('1v1')
        socketUrl = 'ws://' + 'localhost:8000' + '/ws/game/offline/' + user1 + '/' + user2 + '/?token=' + token;
    } else if (matchType === 'tournament') {
        console.log('tournament')
        socketUrl = 'ws://localhost:8000' + '/ws/game/offline/' + user1 + '/' + user2 + '/' + user3 + '/' + user4 + '/?token=' + token;
    }

    socket = new WebSocket(socketUrl);


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
        // this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();

    let currentMatch = 1; // 현재 경기 번호를 저장하는 변수
    const totalMatches = 3; // 토너먼트에서 총 경기는 3번 (Best of 3 형식)

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

            // 경기가 끝났을 때 다음 경기 준비
            if (currentMatch < totalMatches && matchType === 'tournament') {
                currentMatch++;
                console.log(`Starting match ${currentMatch}`);
            } else {
                console.log("Tournament Finished");
                cleanUp(); // 모든 경기가 끝났을 때 정리 작업 수행
            }
        }
    };


    function cleanUp()
    {
        // WebSocket 연결 닫기
        if (socket) {
            socket.close();
            console.log("WebSocket 연결 닫힘");
        }

        // 애니메이션 루프 중단
        // if (this.animationFrameId) {
        //     cancelAnimationFrame(this.animationFrameId);
        //     console.log("애니메이션 루프 중단");
        // }

        // Three.js 렌더러를 DOM에서 제거
        const rendererDom = document.querySelector('canvas');
        if (rendererDom) {
            rendererDom.remove();
            console.log("Three.js 캔버스 제거");
        }
    }

    // 페이지를 떠날 때 정리 작업 추가
    // window.addEventListener('beforeunload', () => cleanUp());
    window.addEventListener('beforeunload', () =>
    {
        console.log("in before");
    });


    // 뒤로가기 및 페이지 이동을 위한 링크 클릭 감지
    window.addEventListener('popstate', cleanUp);


    const nav__logout = document.getElementById('nav__logout');
    nav__logout.addEventListener('click', cleanUp);
    const nav__main = document.getElementById('nav__main');
    nav__main.addEventListener('click', cleanUp);
    const nav__mypage = document.getElementById('nav__mypage');
    nav__mypage.addEventListener('click', cleanUp);
    const nav__friend = document.getElementById('nav__friend');
    nav__friend.addEventListener('click', cleanUp);
    const nav__rank = document.getElementById('nav__rank');
    nav__rank.addEventListener('click', cleanUp);



    // socket.onopen = function() {
    //     console.log("WebSocket connection opened");
    // };

    // socket.onclose = function(event) {
    //     console.log("WebSocket connection closed:", event);
    // };

    // socket.onerror = function(event) {
    //     console.error("WebSocket error occurred:", event);
    // };

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
