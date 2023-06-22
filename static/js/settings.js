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


// 각각의 버튼을 비활성화 해둔다 -> 활성화 해두면 이상한 값을 입력해도 수정되기 때문
document.getElementById("update_nikname_btn").disabled = true;
document.getElementById("update_email_btn").disabled = true;
document.getElementById("update_password_btn").disabled = true;

// 이메일 정규식 확인. {,}는 최소 수와 최대 수를 나타낸다.
let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// 비밀번호는 최소 8자 최대 24자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자. 특수 문자는 ~!@#$%^&*_+\-.<>/? 만 가능
let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*_+\-.<>/?])[A-Za-z\d~!@#$%^&*()_+\-=`[~!@#$%^&*_+\-.<>/?]{8,24}$/;

// 변경 전 nickname과 email을 가져옴 (플로팅 라벨로부터 가져옴)
let nickname_current = $('#nickname_error').text();
let email_current = $('#email_error').text();

// 이메일 주소 유호성 확인. 이메일 양식. 이메일 주소 길이.
$('#input_email').keyup(function () {
    // 이메일 입력란에서 입력된 값을 가져옴
    let email = $('#input_email').val();
    // 플로팅 라벨
    let emailError = $('#email_error');
    emailError.css("color", "#ff0000");

    // 사용자가 입력한 값이 저장해놓은 규칙과 일치한지 확인
    if (!emailRegex.test(email)) {
        // 일치하지 않을 경우 플로팅라벨로 알림, 이메일 수정 버튼 비활성화
        emailError.show().text("올바른 이메일 양식이 아닙니다!")
        document.getElementById("update_email_btn").disabled = true;
        // 만약 입력 값이 공백이 될 경우 -> 사용자가 입력한 값을 다시 지우면 플로팅 라벨을 원래대로 설정, 이메일 수정 버튼 비활성화
        if (email == "") {
            emailError.show().text(email_current);
            emailError.css("color", "gray");
            document.getElementById("update_email_btn").disabled = true;
        }
    } else { // 사용자가 입력한 이메일 형식은 지킨 경우
        // 이메일 주소 길이 확인.
        if (email.length > 24) {
            // 이메일이 너무 긴 경우 형식에 어긋남 -> 플로팅 라벨로 알려줌 , 이메일 수정 버튼 비활성화
            emailError.show().text("이메일 주소가 너무 깁니다.")
            document.getElementById("update_email_btn").disabled = true;
        } else { // 모든 조건을 다 지킨 경우
            // 플로팅 라벨 기본으로 설정, 정상적인 이메일 형식 이므로, 이메일 수정 버튼 활성화
            emailError.show().text("이메일");
            emailError.css("color", "gray");
            document.getElementById("update_email_btn").disabled = false;
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
        // 플로팅 라벨로 사용자 입력란이 비었다고 알림, 닉네임 수정 버튼 비활성화
        nicknameError.show().text(nickname_current);
        nicknameError.css("color", "gray");
        document.getElementById("update_nikname_btn").disabled = true;
    } else { // 사용자가 닉네임 입력란에 어떤 값을 입력한 경우
        // 닉네임에 공백을 포함하지 못하게 한다.
        if (nickname.indexOf(' ') !== -1) {
            // 공백이 포함된 경우 플로팅 라벨로 알려주고 닉네임 수정 버튼 비활성화
            nicknameError.css("color", "#ff0000");
            nicknameError.show().text("공백은 넣을 수 없습니다.")
            document.getElementById("update_nikname_btn").disabled = true;
        } else { // 닉네임에 공백이 없는 경우
            // 닉네임 길이 제한
            if (nickname.length > 24) {
                // 너무 이름이 긴 경우 플로팅 라벨로 알림 , 닉네임 수정 버튼 비활성화
                nicknameError.show().text("닉네임이 너무 깁니다.")
                document.getElementById("update_nikname_btn").disabled = true;
            } else { // 모든 조건을 만족한 경우
                // 정삭적인 이름이므로 플로팅 라벨을 원래대로 하고, 닉네임 수정 버튼 활성화
                nicknameError.show().text("닉네임");
                nicknameError.css("color", "gray");
                document.getElementById("update_nikname_btn").disabled = false;
            }
        }
    }
});

// 비밀번호 유효성 확인
$('#input_password').keyup(function () {
    // 비밀번호 입력란에서 입력된 값을 가져옴
    let password = $('#input_password').val();
    // 플로팅 라벨
    let passwordError = $('#password_error');
    passwordError.css("color", "#ff0000");

    // 사용자가 입력한 값이 저장해놓은 규칙과 일치한지 확인
    if (!passwordRegex.test(password)) {
        // 일치하지 않을 경우 플로팅라벨로 알려주고, 비밀번호 수정 버튼 비활성화
        passwordError.show().text("8~25자, 문자, 숫자, 특수문자 포함")
        document.getElementById("update_password_btn").disabled = true;
        // 만약 입력 값이 공백이 될 경우 -> 사용자가 입력한 값을 다시 지우면 플로팅 라벨을 원래대로 설정
        if (password == "") {
            passwordError.show().text("비밀번호");
            passwordError.css("color", "gray");
            document.getElementById("update_password_btn").disabled = true;
        }
    } else { // 사용자가 입력한 비밀번호 형식을 지킨 경우
        // 플로팅 라벨 기본으로 설정, 정상적인 이메일 형식 이므로 비밀번호 수정 버튼 활성화
        passwordError.show().text("비밀번호");
        passwordError.css("color", "gray");
        document.getElementById("update_password_btn").disabled = false;
    }
});

// 회원탈퇴를 위한 이벤트 처리
$('#profile_dele_btn').click(function () {
    // 회원 탈퇴할 유저의 이메일을 가져옴
    var user_session_email = $(this).attr('user_session_email');
    // 삭제할지 물어봄
    if (confirm("유저 정보를 삭제 하시겠습니까?")) {
        delete_profile_Fn(user_session_email)
    }
});

// 회원 정보 삭제 함수
function delete_profile_Fn(session_email) {
    // 매개변수로 세션 이메일을 받음
    let email = session_email;

    // 서버로 보낼 데이터 json
    $.ajax({
        url: "/user/profile/remove",
        data: {
            email: email
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            // 회원 탈퇴시 로그인 페이지로 이동
            alert("프로필이 성공적으로 삭제 되었습니다.");
            location.replace("/user/login");
        },
        error: function (request, status, error) {
            console.log("에러")
            alert(email);
        },
        complete: function () {
            console.log("완료");
        }
    })
}


// 프로필 사진 업로드 버튼 클릭시 이벤트 처리
$('#button_profile_upload').click(function () {
    $('#input_profileimage_upload').click();
});

// 프로필 사진 업로드 하는 함수
function profile_upload(session_email) {
    // 사용자가 파일시스템에서 사진을 고른 뒤 파일 인풋 태그에 올라온 파일을 꺼내서 변수에 저장
    let file = $('#input_profileimage_upload')[0].files[0];
    // 프로필 사진을 변경할 유저의 이메일
    let email = session_email
    // 폼데이터 객체 선언
    let fd = new FormData();
    // 폼데이터 객체에 데이터를 추가
    fd.append('file', file);
    fd.append('email', email);

    // 서버로 보낼 데이터 form 형식
    $.ajax({
        url: "/user/profile/upload",
        data: fd,
        method: "POST",
        processData: false,
        contentType: false,
        success: function (data) {
            console.log("성공");

        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            location.replace("/user/profile/setting");
        }
    });

}

// 프로필 사진 삭제 버튼 눌렸을 때 프로필 사진을 디폴트 값으로 바꿔주는 이벤트 처리
$('#button_profile_reset').click(function () {
    // 프로필 사진을 리셋할 유저의 이메일을 가져옴
    var email = $(this).attr('user_session_email');

    // 서버로 보낼 데이터 (json)
    $.ajax({
        url: "/user/profile/reset",
        data: {
            email: email
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            alert("프로필 사진이 성공적으로 삭제 되었습니다.");
            location.replace("/user/profile/setting");
        },
        error: function (request, status, error) {
            console.log("에러")
        },
        complete: function () {
            console.log("완료");
        }
    })
});

// 비밀번호 변경 이벤트 처리
$('#update_password_btn').click(function () {
    // 비밀번호를 변경할 유저의 이메일을 가져옴
    var email = $(this).attr('user_session_email');
    // 비밀번호 수정 입력란에 입력된 값을 가져옴
    let password = $('#input_password').val();

    // 서버로 보낼 데이터 json
    $.ajax({
        url: "/user/updatepassword",
        data: {
            email: email,
            password: password
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            // data에 데이터가 있을 경우 잘못된 경우 (중복) 사용자에게 에러메시지를 보여줌
            if (data) {
                $('#password_error').css("color", "#ff0000");
                $('#password_error').show().text(data.message);
                $('#password_error').focus();
            } else { // 비밀번호 변경시 로그인 페이지로 이동
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
})

// 닉네임 변경 이벤트 처리
$('#update_nikname_btn').click(function () {
    // 닉네임을 변경할 유저의 이메일을 가져옴
    var email = $(this).attr('user_session_email');
    // 닉네임 수정 입력란에 입력된 값을 가져옴
    let nikname = $('#input_nickname').val();
    // CSRF 토큰 값을 가져옴
    let csrfmiddlewaretoken = getCookie('csrftoken');

    // 서버로 보낼 데이터 json
    $.ajax({
        url: "/user/profile/updatenickname",
        data: {
            email: email,
            nickname: nikname
        },
        method: "POST",
        headers: {
            'X-CSRFToken': csrfmiddlewaretoken
        },
        success: function (data) {
            console.log("성공");
            // data에 데이터가 있을 경우 잘못된 경우 (중복) 사용자에게 에러메시지를 보여줌
            if (data) {
                $('#nickname_error').css("color", "#ff0000");
                $('#nickname_error').show().text(data.message);
                $('#nickname_error').focus();
            } else {
                location.replace('/user/profile/setting');
            }
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
        }
    });
})

// 이메일 변경 이벤트 처리
$('#update_email_btn').click(function () {
    // 이메일을 변경할 유저의 이메일을 가져옴
    var user_email = $(this).attr('user_session_email');
    // 이메일 수정 입력란에 입력된 값을 가져옴
    let email = $('#input_email').val();
    console.log(user_email);

    // 서버로 보낼 데이터 json
    $.ajax({
        url: "/user/profile/updateemail",
        data: {
            user_email: user_email,
            email: email
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            // data에 데이터가 있을 경우 잘못된 경우 (중복) 사용자에게 에러메시지를 보여줌
            if (data) {
                $('#email_error').css("color", "#ff0000");
                $('#email_error').show().text(data.message)
                $('#email_error').focus();
            } else {
                location.replace('/user/profile/setting');
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