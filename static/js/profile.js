// 팔로우 버튼 및 기능 구현
$('#user_follow_btn').click(function (event) {
    // 팔로우를 하는 사람의 이메일 -> 팔로우 하는 사람은 자기 자신이므로 세션 정보를 가져와야 함
    let session_user_email = document.getElementById("user_follow_btn").getAttribute("user_session_email");
    // 팔로우 당하는 사람의 이메일
    let user_email = document.getElementById("user_follow_btn").getAttribute("user_email");
    // 이벤트가 발생한 태그의 id를 가져옴
    let follow_id = event.target.id;
    // 팔로우 버튼의 글 내용으로 팔로우 여부를 따지기 위해서 가져옴
    let is_followed = $.trim($('#' + follow_id).html());


    // 만약 팔로우 버튼의 글 내용이 팔로우일 경우 -> css토글
    if (is_followed == '팔로우') {
        $('#' + follow_id).html('언팔로우');
        $(this).css({
            width: '90px',
            background: 'gray',
            border: 'none',
        })
    } else { // 만약 팔로우 버튼의 글 내용이 언팔로우일 경우 -> css토글
        $('#' + follow_id).html('팔로우');
        $(this).css({
            width: '74px',
            background: 'rgb(0, 149, 246)',
            border: 'none',
        })

    }
    // 서버로 보낼 데이터 (json)
    $.ajax({
        url: "/user/follow",
        data: {
            session_user_email: session_user_email,
            user_email: user_email,
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            location.reload();
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
        }
    });
});

// 내가 쓴 게시물 보기 버튼 이벤트 처리
$("#button_feed_list").click(function () {
    // 프로필 화면의 내 게시물 버튼 활성화 밑줄 표시
    $('#button_feed_list').css({
        borderTopStyle: "solid",
        color: "black"
    });
    // 프로필 화면의 좋아요 버튼 비활성화 표시
    $('#button_feed_like_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 프로필 화면의 북마크 버튼 비활성화 표시
    $('#button_feed_bookmark_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 정유진: 프로필 화면의 공유카테고리 버튼 비활성화 표시
    $('#button_feed_shared_category_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    //내 게시물의 게시물 보기
    $('#feed_list').css({
        display: 'flex'
    });
    //좋아요의 게시물 숨기기
    $('#like_feed_list').css({
        display: 'none'
    });
    //북마크의 게시물 숨기기
    $('#bookmark_feed_list').css({
        display: 'none'
    });
    // 정유진: 공유카테고리의 게시물 숨기기
    $('#shared_category_list').css({
        display: 'none'
    });
});

// 내가 좋아요한 게시물 이벤트 처리
$("#button_feed_like_list").click(function () {
    // 프로필 화면의 내 게시물 버튼 비활성화 표시
    $('#button_feed_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 프로필 화면의 좋아요 버튼 활성화 밑줄 표시
    $('#button_feed_like_list').css({
        borderTopStyle: "solid",
        color: "black"
    });
    // 프로필 화면의 북마크 버튼 비활성화 표시
    $('#button_feed_bookmark_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 정유진: 프로필 화면의 공유카테고리 버튼 비활성화 표시
    $('#button_feed_shared_category_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    //내 게시물의 게시물 숨기기
    $('#feed_list').css({
        display: 'none'
    });
    //좋아요의 게시물 보기
    $('#like_feed_list').css({
        display: 'flex'
    });
    //북마크의 게시물 숨기기
    $('#bookmark_feed_list').css({
        display: 'none'
    });
    // 정유진: 공유카테고리의 게시물 숨기기
    $('#shared_category_list').css({
        display: 'none'
    });
});

// 내가 북마크한 게시물 이벤트 처리
$("#button_feed_bookmark_list").click(function () {
    //프로필 화면의 내 게시물 버튼 비활성화 표시
    $('#button_feed_list').css({
        borderTopStyle: "none",
        color: "#737373"

    });
    //프로필 화면의 좋아요 버튼 비활성화 표시
    $('#button_feed_like_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 프로필 화면의 북마크 버튼 활성화 밑줄 표시
    $('#button_feed_bookmark_list').css({
        borderTopStyle: "solid",
        color: "black"
    });
    // 정유진: 프로필 화면의 공유카테고리 버튼 비활성화 표시
    $('#button_feed_shared_category_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    //내 게시물의 게시물 숨기기
    $('#feed_list').css({
        display: 'none'
    });
    //좋아요의 게시물 숨기기
    $('#like_feed_list').css({
        display: 'none'
    });
    //북마크의 게시물 보기
    $('#bookmark_feed_list').css({
        display: 'flex'
    });
    // 정유진: 공유카테고리의 게시물 숨기기
    $('#shared_category_list').css({
        display: 'none'
    });
});

// 정유진: 공유카테고리된 게시물 이벤트 처리
$("#button_feed_shared_category_list").click(function () {
    //프로필 화면의 내 게시물 버튼 비활성화 표시
    $('#button_feed_list').css({
        borderTopStyle: "none",
        color: "#737373"

    });
    //프로필 화면의 좋아요 버튼 비활성화 표시
    $('#button_feed_like_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 프로필 화면의 북마크 버튼 비활성화 밑줄 표시
    $('#button_feed_bookmark_list').css({
        borderTopStyle: "none",
        color: "#737373"
    });
    // 정유진: 프로필 화면의  공유카테고리 버튼 활성화 표시
    $('#button_feed_shared_category_list').css({
        borderTopStyle: "solid",
        color: "black"
    });
    //내 게시물의 게시물 숨기기
    $('#feed_list').css({
        display: 'none'
    });
    //좋아요의 게시물 숨기기
    $('#like_feed_list').css({
        display: 'none'
    });
    //북마크의 게시물 보기
    $('#bookmark_feed_list').css({
        display: 'none'
    });
    // 정유진: 공유카테고리의 게시물 보기
    $('#shared_category_list').css({
        display: 'flex'
    });
});