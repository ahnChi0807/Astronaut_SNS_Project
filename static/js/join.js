// 정유진: 가입 버튼 비활성화
document.getElementById("access_button").disabled = true;
// 정유진: W3C에 나와있는 정규식은 /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
// 정유진: 이메일 정규식 확인. {,}는 최소 수와 최대 수를 나타낸다.
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//최소 8자 최대 24자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자. 특수 문자는 ~!@#$%^&*_+\-.<>/? 만 가능
let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*_+\-.<>/?])[A-Za-z\d~!@#$%^&*()_+\-=`[~!@#$%^&*_+\-.<>/?]{8,24}$/;

// 정유진: 버튼 활성화 조건. 이메일, 이름, 닉네임, 비밀번호 모두가 유효성에 만족해야 한다. 만족하면 값을 1로 바꾼다.
let check = [0, 0, 0, 0]

// 정유진: 이메일 주소 유호성 확인. 이메일 양식. 이메일 주소 길이.
$('#input_email').keyup(function () {
    let email = $('#input_email').val();
    let emailError = $('#email_error');
    emailError.css("color", "#ff0000");

    // 정유진: 이메일 유효성 확인. 이메일 양식.
    if (!emailRegex.test(email)) {
        emailError.show().text("올바른 이메일 양식이 아닙니다!")
        check[0] = 0;
        // 정유진: 공백으로 지우면 다시 검은 글자.
        if (email == "") {
            emailError.show().text("이메일 주소");
            emailError.css("color", "#000000");
            check[0] = 0;
        }
    } else {
        // 정유진: 이메일 주소 길이 확인.
        if (email.length > 24) {
            emailError.show().text("이메일 주소가 너무 깁니다.")
            check[0] = 0;
        } else {
            emailError.show().text("이메일");
            emailError.css("color", "#000000");
            check[0] = 1;
        }
    }
    // 정유진: 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})
// 정유진: 이름 유호성 확인.
$('#input_name').keyup(function () {
    let name = $('#input_name').val();
    let nameError = $('#name_error');

    if (name == "") {
        nameError.css("color", "#ff0000");
        nameError.show().text("이름을 넣어주세요");
        check[1] = 0;
    } else {
        nameError.show().text("이름");
        nameError.css("color", "#000000");
        check[1] = 1;
    }

    // 정유진: 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})
// 정유진: 닉네임 유호성 확인. 공백 포함 안 되게. 수정필요
$('#input_nickname').keyup(function () {
    let nickname = $('#input_nickname').val();
    let nicknameError = $('#nickname_error');
    if (nickname == "") {
        nicknameError.css("color", "#ff0000");
        nicknameError.show().text("닉네임을 넣어주세요");
        check[2] = 0;
    } else {
        // 정유진: 닉네임에 공백을 포함하지 못하게 한다.
        if (nickname.indexOf(' ') !== -1) {
            nicknameError.css("color", "#ff0000");
            nicknameError.show().text("공백은 넣을 수 없습니다.")
            check[2] = 0;
        } else {
            // 정유진: 닉네임 길이 제한
            if (nickname.length > 24) {
                nicknameError.show().text("닉네임이 너무 깁니다.")
                check[2] = 0;
            } else {
                nicknameError.show().text("닉네임");
                nicknameError.css("color", "#000000");
                check[2] = 1;
            }
        }
    }

    // 정유진: 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})
// 정유진: 비밀번호 유효성 확인
$('#input_password').keyup(function () {
    let password = $('#input_password').val();
    let passwordError = $('#password_error');
    passwordError.css("color", "#ff0000");

    // 정유진: 유효성 확인
    if (!passwordRegex.test(password)) {
        passwordError.show().text("8~25자, 문자, 숫자, 특수문자 포함")
        check[3] = 0;
        if (password == "") {
            passwordError.show().text("비밀번호");
            passwordError.css("color", "#000000");
            check[3] = 0;
        }
    } else {
        passwordError.show().text("비밀번호");
        passwordError.css("color", "#000000");
        check[3] = 1;

    }
    // 정유진: 버튼 활성화 조건 확인. 이메일, 이름, 닉네임, 비닐번호.
    for (let i = 0; i < check.length; i++) {
        if (check[i]) {
            document.getElementById("access_button").disabled = false;
        } else {
            document.getElementById("access_button").disabled = true;
            return false;
        }
    }
})


// 가입 버튼 클릭시 이벤트 처리
// + 입력칸들의 유효성을 확인 후 버튼 활성화
$('#access_button').click(function () {
    // 각각의 입력 폼에 입력된 내용을 가지고 와서 각각의 변수에 저장
    let email = $('#input_email').val();
    let name = $('#input_name').val();
    let nickname = $('#input_nickname').val();
    let password = $('#input_password').val();

    // 서버로 보내기 위해서 접속할 url : "/user/join"이며 보낼 데이터는 사용자 정보, 방식은 POST (Json 형태)
    $.ajax({
        url: "/user/join",
        data: {
            email: email,
            password: password,
            nickname: nickname,
            name: name
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            // 정유진: 서버에서 받은 데이터가 있다면 메시지(중복 이메일, 닉네임) 알람. 없다면 로그인 페이지로 이동.
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