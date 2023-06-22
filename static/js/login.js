function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// 처음엔 아무 값도 입력되지 않았기 때문에 기본 값은 로그인 버튼 비활성화
document.getElementById("access_button").disabled = true;
// 이메일 유효성 확인. {,}는 최소 수와 최대 수를 나타낸다.
// W3C에 나와있는 이메일 정규식은 /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 이메일 주소 유호성 확인. 이메일 양식. 이메일 주소 길이.
$('#input_email').keyup(function () {
    // 이메일 입력란에서 입력된 값을 가져옴
    let email = $('#input_email').val();
    // 플로팅 라벨
    let emailError = $('#email_error');
    emailError.css("color", "#ff0000");

    // 사용자가 입력한 값이 저장해놓은 규칙과 일치한지 확인
    if (!emailRegex.test(email)) {
        // 일치하지 않을 경우 플로팅라벨로 알려주고 check에 0을 저장하고 로그인 버튼 비활성화
        emailError.show().text("올바른 이메일 양식이 아닙니다!")
        document.getElementById("access_button").disabled = true;
        // 만약 입력 값이 공백이 될 경우 -> 사용자가 입력한 값을 다시 지우면 플로팅 라벨을 검은색 글자로 변경.
        if (email == "") {
            emailError.show().text("이메일 주소");
            emailError.css("color", "#000000");
        }
    } else { // 사용자가 입력한 이메일 형식은 지킨 경우
        // 정상적인 이메일 형식일 경우 플로팅 라벨 기본으로 설정
        emailError.show().text("이메일");
        emailError.css("color", "#000000");
        // 비밀번호 입력란에서 입력된 값을 가져옴, 꼭 이메일
        let password = $('#input_password').val();
        // 이메일은 정상적인 값이므로 비밀번호를 확인해서 버튼을 활성화 비활성화 판단
        // 비밀번호 입력란이 비어있는 경우 비활성화
        if (password == "") {
            document.getElementById("access_button").disabled = true;
        } else {
            document.getElementById("access_button").disabled = false;
        }
    }
})

// 비밀번호 유효성 확인
$('#input_password').keyup(function () {
    // 비밀번호 입력란에서 입력된 값을 가져옴
    let password = $('#input_password').val();
    // 이메일 입력란에서 입력된 값을 가져옴
    let email = $('#input_email').val();
    // 비밀번호에 뭔가 입력된 값이 있다면 이메일을 판단 -> 비밀번호는 왜 검사 안하나? TODO
    if (password != "") {
        // 이메일 유효성 확인 후 버튼 활성화
        if (!emailRegex.test(email)) {
            document.getElementById("access_button").disabled = true;
        } else {
            document.getElementById("access_button").disabled = false;
        }
    }
})

// 로그인 버튼 클릭시 이벤트 처리
$('#access_button').click(function () {
    // 각각의 입력 폼에 입력된 내용을 가지고 와서 각각의 변수에 저장
    let email = $('#input_email').val();
    let password = $('#input_password').val();
    let csrfmiddlewaretoken = getCookie('csrftoken');

    // 서버로 보낼 (Json 형태)
    $.ajax({
        url: "/user/login",
        data: {
            email: email,
            password: password
        },
        method: "POST",
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        },
        success: function (data) {
            // 서버로 전달된 데이터를 토대로 서버로 응답 데이터가 있다면 로그인 실패로 보고 아니라면 로그인 성공으로 봄
            console.log("성공");
            if (data) {
                let emailError = $('#email_error');
                emailError.css("color", "#ff0000");
                emailError.show().text(data.message);
            } else {
                alert("환영 합니다");
                location.replace('/main');
            }
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
        }
    });
});