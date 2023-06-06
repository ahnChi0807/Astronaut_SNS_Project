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
        url: "/content/follow",
        data: {
            session_user_email: session_user_email,
            user_email: user_email,
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
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
$("#button_feed_list").click(function (event) {
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
    // 검색 키워드를 가져와서 전달 (최신 순으로 검색)
    let search = $.trim($('.search_keyword').html());
    // 해시태그 검색인지 일반 검색어 검색인지 구분하기 위해서 #의 위치를 구함
    is_hashtag = search.indexOf('#');
    // #을 제거함 검색어를 서버로 보내기 위한 절차 그냥 보내면 오류
    search = search.replace('#', '');
    // 만약 -1 이면 #이 없다는 뜻 -> 일반 검색
    if (is_hashtag == -1) {
        location.href = "/content/search/?search=" + search
    } else {
        location.href = "/content/search/?search=%23" + search
    }
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
    // 검색 키워드를 가져와서 전달 (좋아요 순으로 검색)
    let search = $.trim($('.search_keyword').html());
    // 해시태그 검색인지 일반 검색어 검색인지 구분하기 위해서 #의 위치를 구함
    is_hashtag = search.indexOf('#');
    // #을 제거함 검색어를 서버로 보내기 위한 절차 그냥 보내면 오류
    search = search.replace('#', '');
    // 만약 -1 이면 #이 없다는 뜻 -> 일반 검색
    if (is_hashtag == -1) {
        location.href = "/content/likesearch/?search=" + search
    } else {
        location.href = "/content/likesearch/?search=%23" + search
    }
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
    // 검색 키워드를 가져와서 전달 (댓글 순으로 검색)
    let search = $.trim($('.search_keyword').html());
    // 해시태그 검색인지 일반 검색어 검색인지 구분하기 위해서 #의 위치를 구함
    is_hashtag = search.indexOf('#');
    // #을 제거함 검색어를 서버로 보내기 위한 절차 그냥 보내면 오류
    search = search.replace('#', '');
    // 만약 -1 이면 #이 없다는 뜻 -> 일반 검색
    if (is_hashtag == -1) {
        location.href = "/content/replysearch/?search=" + search
    } else {
        location.href = "/content/replysearch/?search=%23" + search
    }
});
