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


// 처음엔 아무 값도 입력되지 않았기 때문에 기본 값은 가입 버튼 비활성화
document.getElementById("access_button").disabled = true;
// W3C에 나와있는 정규식은 /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
// 이메일 정규식 확인. {,}는 최소 수와 최대 수를 나타낸다.
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//최소 8자 최대 24자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자. 특수 문자는 ~!@#$%^&*_+\-.<>/? 만 가능
let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*_+\-.<>/?])[A-Za-z\d~!@#$%^&*()_+\-=`[~!@#$%^&*_+\-.<>/?]{8,24}$/;

// 버튼 활성화 조건 순서대로 [이메일, 이름, 닉네임, 비밀번호] 모두가 유효성에 만족해야 한다. 만족하면 값을 1로 바꾼다.
let check = [0, 0, 0, 0]

// 이메일 주소 유호성 확인. 이메일 양식. 이메일 주소 길이.
$('#input_email').keyup(function () {
    // 이메일 입력란에서 입력된 값을 가져옴
    let email = $('#input_email').val();
    // 플로팅 라벨
    let emailError = $('#email_error');
    // TODO? 왜 있어야하는지?
    emailError.css("color", "#ff0000");

    // 사용자가 입력한 값이 저장해놓은 규칙과 일치한지 확인
    if (!emailRegex.test(email)) {
        // 일치하지 않을 경우 플로팅라벨로 알려주고 check에 0을 저장,
        emailError.show().text("올바른 이메일 양식이 아닙니다!")
        check[0] = 0;
        // 만약 입력 값이 공백이 될 경우 -> 사용자가 입력한 값을 다시 지우면 플로팅 라벨을 검은색 글자로 변경.
        if (email == "") {
            // 다시 입력해야 하기 때문에 플로팅라벨을 기본 값으로 설정하고 check에 0을 저장
            emailError.show().text("이메일 주소");
            emailError.css("color", "#000000");
            check[0] = 0;
        }
    } else { // 사용자가 입력한 이메일 형식은 지킨 경우
        // 사용자가 입력한 이메일 주소 길이 확인.
        if (email.length > 24) {
            // 이메일이 너무 긴 경우 형식에 어긋남 -> 플로팅 라벨로 알려줌 -> check에 0을 저장
            emailError.show().text("이메일 주소가 너무 깁니다.")
            check[0] = 0;
        } else { // 모든 조건을 다 지킨 경우
            // 플로팅 라벨 기본으로 설정, 정상적인 이메일 형식 이므로 check에 1을 저장
            emailError.show().text("이메일 주소");
            emailError.css("color", "#000000");
            check[0] = 1;
        }
    }
    // 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비밀번호.
    for (let i = 0; i < check.length; i++) {
        // 만약 check가 모두 1일 경우 가입버튼 활성화, 하나라도 0일 경우 return으로 인해 가입버튼 비활성화
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})

// 이름 유호성 확인.
$('#input_name').keyup(function () {
    // 이름 입력란에서 입력된 값을 가져옴
    let name = $('#input_name').val();
    // 플로팅 라벨
    let nameError = $('#name_error');

    // 사용자가 이름 입력란을 비워놓은 경우
    if (name == "") {
        // 플로팅 라벨로 사용자 입력란이 비었다고 알림 check에는 0을 저장
        nameError.css("color", "#ff0000");
        nameError.show().text("이름을 넣어주세요");
        check[1] = 0;
    } else { // 사용자가 이름 입력란에 어떤 값을 입력한 경우
        // 이름 길이를 체크
        if (name.length > 24) {
            // 너무 이름이 긴 경우 플로팅 라벨로 알림 , check에는 0을 저장
            nameError.css("color", "#ff0000");
            nameError.show().text("이름이 너무 깁니다.")
            check[1] = 0;
        } else { // 모든 조건을 만족한 경우
            // 정삭적인 이름이므로 플로팅 라벨을 원래대로 하고, check에 1을 저장
            nameError.show().text("이름");
            nameError.css("color", "#000000");
            check[1] = 1;
        }

    }

    // 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        // 만약 check가 모두 1일 경우 가입버튼 활성화, 하나라도 0일 경우 return으로 인해 가입버튼 비활성화
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})
// 닉네임 유호성 확인
$('#input_nickname').keyup(function () {
    // 닉네임 입력란에서 입력된 값을 가져옴
    let nickname = $('#input_nickname').val();
    // 플로팅 라벨
    let nicknameError = $('#nickname_error');
    // 사용자가 닉네임 입력란을 비워놓은 경우
    if (nickname == "") {
        // 플로팅 라벨로 알림, check에는 0을 저장
        nicknameError.css("color", "#ff0000");
        nicknameError.show().text("닉네임을 넣어주세요");
        check[2] = 0;
    } else { // 사용자가 이름 입력란에 어떤 값을 입력한 경우
        // 닉네임에 공백을 포함하지 못하게 한다.
        if (nickname.indexOf(' ') !== -1) {
            // 닉네임에 공백이 포함되었다는걸 플로팅 라벨로 알림, check에는 0을 저장
            nicknameError.css("color", "#ff0000");
            nicknameError.show().text("공백은 넣을 수 없습니다.")
            check[2] = 0;
        } else { // 입력값은 있지만 공백이 없는 경우
            // 닉네임 길이 제한
            if (nickname.length > 24) {
                // 너무 닉네임이 긴 경우 플로팅 라벨로 알림 , check에는 0을 저장
                nicknameError.show().text("닉네임이 너무 깁니다.")
                check[2] = 0;
            } else { // 모든 조건을 만족한 경우
                // 정삭적인 닉네임이므로 플로팅 라벨을 원래대로 하고, check에 1을 저장
                nicknameError.show().text("닉네임");
                nicknameError.css("color", "#000000");
                check[2] = 1;
            }
        }
    }

    // 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        // 만약 check가 모두 1일 경우 가입버튼 활성화, 하나라도 0일 경우 return으로 인해 가입버튼 비활성화
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})
// 비밀번호 유효성 확인
$('#input_password').keyup(function () {
    // 비밀번호 입력란에서 입력된 값을 가져옴
    let password = $('#input_password').val();
    // 플로팅 라벨
    let passwordError = $('#password_error');
    passwordError.css("color", "#ff0000");

    // 사용자가 입력한 값이 저장해놓은 규칙과 일치한지 확인
    if (!passwordRegex.test(password)) {
        // 일치하지 않을 경우 플로팅라벨로 알려주고 check에 0을 저장,
        passwordError.show().text("8~25자, 문자, 숫자, 특수문자 포함")
        check[3] = 0;
        // 만약 입력 값이 공백이 될 경우 -> 사용자가 입력한 값을 다시 지우면 플로팅 라벨을 검은색 글자로 변경.
        if (password == "") {
            passwordError.show().text("비밀번호");
            passwordError.css("color", "#000000");
            check[3] = 0;
        }
    } else { // 사용자가 입력한 비밀번호 형식을 지킨 경우
        // 플로팅 라벨 기본으로 설정, 정상적인 이메일 형식 이므로 check에 1을 저장
        passwordError.show().text("비밀번호");
        passwordError.css("color", "#000000");
        check[3] = 1;

    }
    // 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        // 만약 check가 모두 1일 경우 가입버튼 활성화, 하나라도 0일 경우 return으로 인해 가입버튼 비활성화
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})


// 가입 버튼 클릭시 이벤트 처리
$('#access_button').click(function () {
    // 각각의 입력 폼에 입력된 내용을 가지고 와서 각각의 변수에 저장
    let email = $('#input_email').val();
    let name = $('#input_name').val();
    let nickname = $('#input_nickname').val();
    let password = $('#input_password').val();
    let csrfmiddlewaretoken = getCookie('csrftoken');

    // 서버로 보낼 데이터 (Json 형태)
    $.ajax({
        url: "/user/join",
        data: {
            email: email,
            password: password,
            nickname: nickname,
            name: name
        },
        method: "POST",
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        },
        success: function (data) {
            console.log("성공");
            // 서버에서 받은 데이터가 있다면 메시지(중복 이메일, 닉네임) 알람. 없다면 로그인 페이지로 이동.
            if (data) {
                alert(data.message)
            } else {
                location.replace('/user/login');
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