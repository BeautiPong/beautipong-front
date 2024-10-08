import { getRouter } from '../../js/router.js';
import('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
import {SERVER_IP} from "../../js/index.js";

export default class offlineGamePage {
    render() {
        return `
            <div class="offline_game">
                <div class="offline_game">
                    <div id="scoreboard">
                        <div class="scoreboard__userinfo">
                            <span class="player_nickname" id="player1_nickname"></span>
                            <span class="player_score" id="player1_score"></span>
                        </div>
                        <span> : </span>
                        <div class="scoreboard__userinfo">
                            <span class="player_score" id="player2_score"></span>
                            <span class="player_nickname" id="player2_nickname"></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {

    console.log("offline_game.js");
    // Django 템플릿에서 전달된 정보를 JavaScript로 가져오기
    const token = localStorage.getItem("access_token");
    // console.log("token: ", token);
    const urlParams = new URLSearchParams(window.location.search);

    const matchType = urlParams.get('matchType');
    const user1 = urlParams.get('player1') || 'user1';
    const user2 = urlParams.get('player2') || 'user2';
    let user3 = null;
    let user4 = null;

    if(matchType === 'tournament') {
        user3 = urlParams.get('player3') || 'user3';
        user4 = urlParams.get('player4') || 'user4';
    }

    // WebSocket 연결이나 게임 로직에서 user1, user2 사용

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
        // 백엔드로 POST 요청을 보냅니다.
        const response = await fetch(`https://${SERVER_IP}/api/game/offline/`, {
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
    if (matchType === '1vs1') {
        socketUrl = 'wss://' + `${SERVER_IP}` + '/ws/game/offline/' + user1 + '/' + user2 + '/?token=' + token;
    } else if (matchType === 'tournament') {
        socketUrl = `wss://${SERVER_IP}` + '/ws/game/offline/' + user1 + '/' + user2 + '/' + user3 + '/' + user4 + '/?token=' + token;
    }

    socket = new WebSocket(socketUrl);
    console.log("socket is constructed: ", socket);

    // 서버로부터 받아온 테이블, 패들 정보
    const tableWidth = 100;
    const tableLength = 50;
    const paddleWidth = 3;

    // Three.js 기본 설정
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9CD3E7);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 탁구대 생성
    const tableGeometry = new THREE.PlaneGeometry(tableWidth, tableLength);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x6ED087 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.rotation.x = -Math.PI / 2;  // 테이블이 바닥에 놓이도록 설정
    table.position.y = 0;  // 테이블의 높이를 약간 조정
    scene.add(table);

    // 흰색 테두리 생성
    const borderThickness = 0.5;  // 테두리 두께
    const borderColor = 0xffffff;  // 테두리 색상 (흰색)

    // 상단 테두리
    const topBorderGeometry = new THREE.PlaneGeometry(tableWidth, borderThickness);
    const topBorderMaterial = new THREE.MeshPhongMaterial({ color: borderColor });
    const topBorder = new THREE.Mesh(topBorderGeometry, topBorderMaterial);
    topBorder.rotation.x = -Math.PI / 2;
    topBorder.position.set(0, 0.01, -tableLength / 2);  // 테두리를 테이블 위로 살짝 올림
    scene.add(topBorder);

    // 하단 테두리
    const bottomBorder = topBorder.clone();
    bottomBorder.position.set(0, 0.01, tableLength / 2);
    scene.add(bottomBorder);

    // 좌측 테두리
    const leftBorderGeometry = new THREE.PlaneGeometry(borderThickness, tableLength);
    const leftBorderMaterial = new THREE.MeshPhongMaterial({ color: borderColor });
    const leftBorder = new THREE.Mesh(leftBorderGeometry, leftBorderMaterial);
    leftBorder.rotation.x = -Math.PI / 2;
    leftBorder.position.set(-tableWidth / 2, 0.01, 0);
    scene.add(leftBorder);

    // 우측 테두리
    const rightBorder = leftBorder.clone();
    rightBorder.position.set(tableWidth / 2, 0.01, 0);
    scene.add(rightBorder);

    // 네트 생성
    const netHeight = 3;  // 네트의 높이
    const netWidth = 0.2;  // 네트의 두께
    const netLength = tableLength;
    const netColor = 0xFFFFFF;  // 네트 색상 (검은색)

    // 네트의 geometry와 material 설정
    const netGeometry = new THREE.BoxGeometry(netWidth, netHeight, netLength);
    const netMaterial = new THREE.MeshPhongMaterial({ color: netColor, side: THREE.DoubleSide }); // 양면에서 네트를 볼 수 있도록 설정
    const net = new THREE.Mesh(netGeometry, netMaterial);

    // 네트 위치 설정 (테이블 세로 중간에 가로지르도록 배치)
    net.position.set(0, netHeight / 2, 0);  // 세로 중간에 네트를 배치, 높이는 네트 높이의 절반만큼 올림
    scene.add(net);

    // 공 생성
    const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 1, 0);
    scene.add(ball);

    // 패들 생성
    const paddleHeight = 0.2; // 패들의 높이
    const paddleDepth = 8;  // 패들의 깊이 
    const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);  // 패들의 크기 설정
    const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xFF897D });  // 패들 색상: 파란색

    const player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    player1Paddle.position.set(-tableWidth / 2 + paddleWidth / 2, paddleHeight / 2, 0); // player1 패들의 x 위치를 왼쪽 끝에 고정
    scene.add(player1Paddle);

    const player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    player2Paddle.position.set(tableWidth / 2 - paddleWidth / 2, paddleHeight / 2, 0);  // player2 패들의 x 위치를 오른쪽 끝에 고정
    scene.add(player2Paddle);

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0x404040);  // 부드러운 환경광 추가
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);  // 강한 직사광 조명 추가
    light.position.set(0, 40, 50);  // 조명 위치를 조정하여 테이블 위로 내려오게 설정
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
            document.getElementById('player1_nickname').textContent = `${data.state.player1}`;
            document.getElementById('player2_nickname').textContent = `${data.state.player2}`;
            document.getElementById('player1_score').textContent = `${data.state.player1_score}`;
            document.getElementById('player2_score').textContent = `${data.state.player2_score}`;
        }

        else if (data.type === 'game_end') {
            alert('Game Over - ' + data.winner + ' wins!');
            socket.send(JSON.stringify({ type: 'game_end_ack' }));

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

        const router = getRouter();
        if (router) {
            document.querySelector('.nav-container').style.display = 'block';
            router.navigate('/');
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


    // const nav__logout = document.getElementById('nav__logout');
    // nav__logout.addEventListener('click', cleanUp);
    // const nav__main = document.getElementById('nav__main');
    // nav__main.addEventListener('click', cleanUp);
    // const nav__mypage = document.getElementById('nav__mypage');
    // nav__mypage.addEventListener('click', cleanUp);
    // const nav__friend = document.getElementById('nav__friend');
    // nav__friend.addEventListener('click', cleanUp);
    // const nav__rank = document.getElementById('nav__rank');
    // nav__rank.addEventListener('click', cleanUp);



    // socket.onopen = function() {
    //     console.log("WebSocket connection opened");
    // };

    socket.onclose = function(event) {
        socket = null;
        console.log("WebSocket connection closed:", event);
    };

    socket.onerror = function(event) {
        console.error("WebSocket error occurred:", event);
    };

    const validKeys = ['KeyW', 'KeyS', 'KeyO', 'KeyL']; // 한글 자음을 Key로 매핑 (자음에 해당하는 Key 값을 적어야 함)
    const keysPressed = {};  // 누른 키를 저장할 객체

    // Three.js에서 사용되는 canvas 요소를 가져옵니다.
    const canvas = document.querySelector('canvas');

    // canvas가 포커스를 받을 수 있도록 tabindex를 설정합니다.
    canvas.setAttribute('tabindex', '0');

    // canvas 요소를 클릭하면 포커스를 설정해 키 입력을 받을 수 있도록 합니다.
    canvas.focus();


    // canvas 요소에 keydown 이벤트 등록
    canvas.addEventListener('keydown', (event) => {
        // console.log("in keydown socket: ", socket);
        if(socket == null)
            console.log("socket is null: ",socket);

        const keyCode = event.code;  // 키의 물리적 코드로 처리
        if (validKeys.includes(keyCode)) {
            keysPressed[keyCode] = true;
            handleKeyPresses();  // 키가 눌렸을 때 처리
        }
    });

    // canvas 요소에 keyup 이벤트 등록
    canvas.addEventListener('keyup', (event) => {
        const keyCode = event.code;
        if (validKeys.includes(keyCode)) {
            delete keysPressed[keyCode];
        }
    });

    // handleKeyPresses 함수 정의
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
