// 클릭한 게시물의 feed_id를 모달에 넘겨 주는 이벤트 처리
$(".feed_modal").click(function () {
    // 클릭한 댓글 더보기가 있는 피드의 feed_id 속성 값을 가져옴.
    var feed_id = $(this).attr('feed_id');
    // 피드 모달은 id값이 feed_modal임 피드모달에 feed_id속성과 속성 값을 추가 ( 클릭 당시 feed_id 속성을 부여해서 몇번 피드를 눌렀는지 확인하는 용도)
    document.getElementById("feed_modal").setAttribute("feed_id", feed_id);
    // 피드 모달의 댓글 게시 부분에 마찬 가지 feed_id속성과 속성 값을 추가 ( 클릭 당시 feed_id 속성을 부여해서 몇번 피드에 댓글을 게시했는지 확인하는 용도)
    document.getElementById("reply_content_upload").setAttribute("feed_id", feed_id);
    // 해당 문서의 스크롤을 가림 TODO
    $(document.body).css({
        overflow: 'hidden'
    });
    // 서버로 보낼 데이터 (Json)
    $.ajax({
        url: "/content/feedmodal",
        data: {
            feed_id: feed_id
        },
        method: "GET",
        success: function (data) {
            console.log("성공");
            // 모달창은 페이지가 아니므로 새로고침 개념이 없음 따라서 모달창이 열리는 시점으로 이벤트 처리를 해야하므로 비동기로 처리되야 함
            // 서버로 부터 전달 받은 게시물 이미지, 내용, 작성자 프로필 이미지, 작성자 닉네임 변수에 따로 할당.
            var feed_image = "/media/" + data['image'];
            var feed_content = data['feed_content'];
            var writer_profile_image = "/media/" + data['writer_profile_image'];
            var writer_nickname = data['writer_nickname'];
            var category = data['category'];
            var category_kr = data['category_kr'];

            // 피드 모달창을 열 때 댓글리스트를 불러오는데 모달창을 닫아도 계속 댓글 리스트가 남아있음 때문에 모달창을 여는 시점으로 해서 댓글리스트를 리셋해줘야 함
            $("#feed_modal_reply_list").html('');
            // 서버에서 받은 댓글 리스트 길이만큼 반복문을 수행
            for (var i = 0; i < data['reply_list'].length; i++) {
                // 댓글리스트에서 댓글 작성자 프로필이미지, 닉네임, 댓글 작성 내용을 뽑아서 변수에 저장
                var reply_profile_image = "/media/" + data['reply_list'][i].profile_image;
                var reply_nickname = data['reply_list'][i].nickname;
                var reply_content = data['reply_list'][i].reply_content;

                // <부모 : 특정 피드의 댓글 리스트> append <자식 : 댓글 한 줄 영역 >
                $("#feed_modal_reply_list").append('<div id="feed_modal_reply_' + i + '" class="feed_modal_reply_area"></div>');

                // <부모 : 댓글 한 줄 > append <자식 : 프로필 이미지 영역 >
                $("#feed_modal_reply_" + i).append('<div id="feed_modal_reply_profile_image_' + i + '" class="box profile feed_modal_reply_profile_image_area"></div>');
                // <부모 : 댓글 한 줄 > append <자식 : 프로필 닉네임, 댓글 내용 영역 >
                $("#feed_modal_reply_" + i).append('<div id="feed_modal_reply_nickname_content_' + i + '" class="feed_modal_reply_nickname_content_area"></div>');

                // <부모 : 프로필 닉네임, 댓글 내용 영역> append <자식 : 프로필 닉네임 >
                $("#feed_modal_reply_nickname_content_" + i).append('<div id="feed_modal_reply_nickname_' + i + '" class="feed_modal_reply_nickname_area"></div>');
                // <부모 : 프로필 닉네임, 댓글 내용 영역> append <자식 : 댓글 내용 >
                $("#feed_modal_reply_nickname_content_" + i).append('<div id="feed_modal_reply_content_' + i + '" class="text_line feed_modal_reply_content_area"></div>');

                //각각 알맞는 태그 본문에 프로필이미지, 프로필 닉네임, 댓글 내용을 채워 넣음
                $("#feed_modal_reply_profile_image_" + i).append('<img id="' + reply_nickname + '" class="feed_modal_reply_profile_image movetoprofile" src="' + reply_profile_image + '">');
                $("#feed_modal_reply_nickname_" + i).append('<div id="' + reply_nickname + '" class="feed_modal_reply_nickname movetoprofile">' + reply_nickname + '</div>');
                $("#feed_modal_reply_content_" + i).append('<div class="feed_modal_reply_content">' + reply_content + '</div>');
            }

            // 좋아요, 북마크, 좋아요 수, 게시물 작성시간을 가져옴.
            var is_liked = data['is_liked'];
            var is_marked = data['is_marked'];
            var like_count = data['like_count'];
            var feed_create_at = data['feed_create_at'];

            // 게시물 이미지, 내용, 작성자 프로필 이미지, 작성자 닉네임을 알맞는 태그의 본문에 할당
            $("#feed_modal_image").html('<img style="" src="' + feed_image + '">');
            $("#feed_modal_feed_content").html('<div>' + feed_content + '</div>');
            $(".feed_modal_profile_image").html('<img id="' + writer_nickname + '" class="movetoprofile" src="' + writer_profile_image + '">');
            $(".feed_modal_nickname").html('<div id="' + writer_nickname + '" class="movetoprofile">' + writer_nickname + '</div>');

            // 정유진: 카테고리 추가
            $("#feed_modal_category").html(category_kr)

            // 피드 모달창을 열 때 해시태그 리스트 를 불러오는데 모달창을 닫아도 계속 해시태그 리스트가 남아있음 때문에 모달창을 여는 시점으로 해서 해시태그 리스트를 리셋해줘야 함
            $(".feed_modal_contents_writer_hashtags").html('');
            // 만약 해시태그가 하나라도 있는 경우
            if (data['hashtag_list'].length > 0) {
                // <부모 : 해시태그 영역 자체 틀 (부모)> append <자식 : 특정 피드의 해시태그가 배치될 영역(자식) >
                $(".feed_modal_contents_writer_hashtags").append('<div class="feed_area_hashtags feed_modal_hashtags text_line" id="feed_modal_hashtag_div_' + feed_id + '" style="display: flex"></div>');
                // 반복문을 통해 특정 피드에 해시태그를 채워 넣음
                for (var i = 0; i < data['hashtag_list'].length; i++) {
                    var reply_hashtag = data['hashtag_list'][i];
                    // <부모 : 특정 피드의 해시태그가 배치될 영역> append <자식 : 해시태그>
                    $("#feed_modal_hashtag_div_" + feed_id).append('<div id="feed_modal_hashtags_list" class="hashtags" hashtag_content="' + reply_hashtag + '">#' + reply_hashtag + '</div>');
                }
            }

            // 좋아요, 북마크 여부에 따라 상황에 맞는 좋아요 북마크 아이콘을 피드 모달에 추가
            if (is_liked)
                $("#feed_modal_is_liked").html(
                    '<span id="feed_modla_favorite_' + feed_id + '" feed_id="' + feed_id + '" style="color: red" class="uTrue favorite material-symbols-outlined">favorite</span>');
            else
                $("#feed_modal_is_liked").html(
                    '<span id="feed_modla_favorite_' + feed_id + '" feed_id="' + feed_id + '" class="uFalse favorite material-symbols-outlined">favorite</span>');

            if (is_marked)
                $("#feed_modal_is_marked").html(
                    '<span id="feed_modla_bookmark_' + feed_id + '" feed_id="' + feed_id + '" class="uTrue bookmark material-symbols-outlined">bookmark</span>');
            else
                $("#feed_modal_is_marked").html(
                    '<span id="feed_modla_bookmark_' + feed_id + '" feed_id="' + feed_id + '" class="uFalse bookmark material-symbols-outlined">bookmark</span>');

            // <부모 : 좋아요 수 태그 영역> append <자식 : 좋아요 수>
            $("#feed_modal_like_count").html('<div class="feed_modal_like_count">좋아요 수 ' + '<b class="async_like_count_' + feed_id + '">' + like_count + '명' + '</b>' + '</div>');
            // <부모 : 작성 시간 태그 영역> append <자식 : 작성시간>
            $("#feed_modal_feed_create_at").html('<div class="feed_modal_feed_create_at">' + feed_create_at + '</div>');

            // 댓글 게시할 때 댓글리스트에서 몇 번째인지 알려준다. 마지막으로 입력한 댓글을 기점으로 이어서 댓글 게시 하기 위함 TODO
            document.getElementById("reply_content_upload").setAttribute("reply_id", data['reply_list'].length);

            // 피드모달을 보여줌 (데이터를 불러온 뒤 보여주기 위함)
            $("#feed_modal").css({
                display: 'flex'
            });

            // 모달안에서 기능들이 동작하게 하려면 모달안에 기능이 존재해야 함

            // 북마크 아이콘 클릭 이벤트 처리
            $(".bookmark").click(function (event) {
                // 북마크 아이콘 태그의 feed_id 속성 값을 가져옴 ( 피드는 여러개이므로 어떤 피드에 북마크를 했는지 알아야함 )
                let feed_id = event.target.attributes.getNamedItem('feed_id').value;
                // 이벤트가 발생한 북마크 태그의 id를 가져옴 (id 형태는 bookmark_{{ feed.id }} )
                let bookmark_id = event.target.id;
                // 해당 태그의 style 속성중 color 값을 가져옴
                let bookmark_color = $('#' + bookmark_id).css('color');

                // 현재 북마크 상태가 아니면 북마크 상태로 바꿈 -> css를 토글하는 개념
                if (bookmark_color === 'rgb(0, 0, 0)') {
                    $(this).css({"font-variation-settings": "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 48"});
                    $(this).css({
                        color: 'rgb(0, 0, 1)'
                    });
                } else {
                    $(this).css({"font-variation-settings": "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48"});
                    $(this).css({
                        color: 'black',
                    });
                }
                // 서버로 보낼 (Json 형태)
                $.ajax({
                    url: "/content/bookmark",
                    data: {
                        feed_id: feed_id,
                        bookmark_color: bookmark_color
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

            // 좋아요 심볼 클릭 이벤트
            $(".favorite").click(function (event) {
                // 좋아요 아이콘 태그의 feed_id 속성 값을 가져옴 ( 피드는 여러개이므로 어떤 피드에 좋아요를 했는지 알아야함 )
                let feed_id = event.target.attributes.getNamedItem('feed_id').value;
                // 이벤트가 발생한 좋아요 태그의 id를 가져옴 (id 형태는 like_{{ feed.id }} )
                let favorite_id = event.target.id;
                // 해당 태그의 style 속성중 color 값을 가져옴
                let favorite_color = $('#' + favorite_id).css('color');

                // 현재 좋아요 상태가 아니면 북마크 상태로 바꿈 -> css를 토글하는 개념
                if (favorite_color === 'rgb(0, 0, 0)') {
                    $(this).css({"font-variation-settings": "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 48"});
                    $(this).css({
                        color: 'red',
                    });
                } else {
                    $(this).css({"font-variation-settings": "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48"});
                    $(this).css({
                        color: 'black',
                    });
                }

                // 서버로 보낼 (Json 형태)
                $.ajax({
                    url: "/content/like",
                    data: {
                        feed_id: feed_id,
                        favorite_color: favorite_color
                    },
                    method: "POST",
                    success: function (data) {
                        // data에는 사용자가 좋아요를 누르고 테이블에 값이 저장되었으니 그 이후에 수를 계산한 값이 들어있다.
                        console.log("성공");
                        // 좋아요 수를 비동기로 처리
                        var async_like_count = data['async_like_count'];
                        console.log(async_like_count);
                        $(".async_like_count_" + feed_id).html(async_like_count + '명');
                    },
                    error: function (request, status, error) {
                        console.log("에러");
                    },
                    complete: function () {
                        console.log("완료");

                    }
                });
            });

            // 화면에서 다른사용자의 프로필 클릭시 해당 사용자의 프로필로 이동
            $(".movetoprofile").click(function (event) {
                let user_nickname = event.target.id;
                location.href = "/user/reprofile?user_nickname=" + user_nickname;
            });

            // 해시태그를 눌렸을 때 해시태그를 검색함
            $('.hashtags').click(function () {
                let hashtag_content = $(this).attr('hashtag_content');
                location.href = "/content/search/?search=%23" + hashtag_content
            });
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
        }
    });
});

// 피드 모달에서 댓글 게시 버튼 이벤트 처리
$(".modal_upload_reply").click(function (event) {
    // 게시 버튼 태그의 feed_id 속성 값을 가져옴 ( 피드는 여러개이므로 어떤 피드에 댓글을 게시 했는지 알아야함 )
    let feed_id = event.target.attributes.getNamedItem('feed_id').value;
    // 댓글 리스트중 마지막 번째 댓글 아이디를 가져옴 -> 마지막으로 게시된 댓글을 이어서 게시 해야하기 때문
    let relpy_upload_id = document.getElementById("reply_content_upload").getAttribute("reply_id");
    // 댓글 입력 폼의 아이디를 통해서 입력 폼의 내용을 가져옴
    let reply_content = $('#reply_content_text').val();

    // 댓글의 길이가 0보다 작으면 알림창 뜸
    if (reply_content.length <= 0) {
        alert("댓글을 입력하세요");
        return 0;
    }

    //서버로 보낼 (Json 형태)
    $.ajax({
        url: "/content/reply",
        data: {
            feed_id: feed_id,
            reply_content: reply_content
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            alert("댓글 성공");

            // <부모 : 특정 피드의 댓글 리스트> append <자식 : 댓글 한 줄 영역 >
            $("#feed_modal_reply_list").append('<div id="feed_modal_reply_' + relpy_upload_id + '" class="feed_modal_reply_area"></div>');
            // <부모 : 댓글 한 줄 > append <자식 : 프로필 이미지 영역 >
            $("#feed_modal_reply_" + relpy_upload_id).append('<div id="feed_modal_reply_profile_image_' + relpy_upload_id + '" class="box profile feed_modal_reply_profile_image_area"></div>');
            // <부모 : 댓글 한 줄 > append <자식 : 프로필 닉네임, 댓글 내용 영역 >
            $("#feed_modal_reply_" + relpy_upload_id).append('<div id="feed_modal_reply_nickname_content_' + relpy_upload_id + '" class="feed_modal_reply_nickname_content_area"></div>');
            // <부모 : 프로필 닉네임, 댓글 내용 영역> append <자식 : 프로필 닉네임 >
            $("#feed_modal_reply_nickname_content_" + relpy_upload_id).append('<div id="feed_modal_reply_nickname_' + relpy_upload_id + '" class="feed_modal_reply_nickname_area"></div>');
            // <부모 : 프로필 닉네임, 댓글 내용 영역> append <자식 : 댓글 내용 >
            $("#feed_modal_reply_nickname_content_" + relpy_upload_id).append('<div id="feed_modal_reply_content_' + relpy_upload_id + '" class="text_line feed_modal_reply_content_area"></div>');

            //각각 알맞는 태그 본문에 프로필이미지, 프로필 닉네임, 댓글 내용을 채워 넣음
            $("#feed_modal_reply_profile_image_" + relpy_upload_id).append('<img id="' + data['user_nickname'] + '" class="movetoprofile feed_modal_reply_profile_image" src="/media/' + data['user_profile_image'] + '">');
            $("#feed_modal_reply_nickname_" + relpy_upload_id).append('<div id="' + data['user_nickname'] + '" class="movetoprofile feed_modal_reply_nickname">' + data['user_nickname'] + '</div>');
            $("#feed_modal_reply_content_" + relpy_upload_id).append('<div class="feed_modal_reply_content">' + reply_content + '</div>');

            // 화면에서 다른사용자의 프로필 클릭시 해당 사용자의 프로필로 이동
            $(".movetoprofile").click(function (event) {
                let user_nickname = event.target.id;
                location.href = "/user/reprofile?user_nickname=" + user_nickname;
            });
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            // 댓글을 입력하고 나면 입력 폼을 비워야 함
            $('#reply_content_text').val('');
            // 해당 피드의 마지막 댓글의 다음 번째를 넘겨준다. 마지막 댓글에 이어서 댓글이 작성되어야 함
            let relpy_upload_next_id = String(Number(relpy_upload_id) + 1);
            document.getElementById("reply_content_upload").setAttribute("reply_id", relpy_upload_next_id);
        }
    });

});

// 모달창 닫기 버튼 이벤트 처리
$(".modal_close").click(function () {
    // 모달창 닫았을 때 본문 스크롤 가능
    $(document.body).css({
        overflow: 'visible'
    });

    // 모달창 닫았을 때 백그리운드 색 및 이미지 리셋
    $('.img_upload_space').css({
        "background-color": "White",
        "background-image": ""
    });

    // 파일 업로드 인풋태그 초기화
    var input = document.getElementById('input_image_upload');
    input.value = null;

    // 모달창 닫기와 닫았을 때 글내용을 리셋하는 부분
    $('#input_feed_content').each(function () {
        $(this).val('');
    });
    // 모달창 닫기와 닫았을 때 해시태그 내용을 리셋하는 부분
    $('#input_feed_hashtag').each(function () {
        $(this).val('');
    });
    // 첫 번째 모달창 숨김
    $('#first_modal').css({
        display: 'none'
    });
    // 두 번째 모달창 숨김
    $('#second_modal').css({
        display: 'none'
    });
    // 세 번째 모달창 숨김
    $('#third_modal').css({
        display: 'none'
    });
    // 피드 모달 숨김
    $('#feed_modal').css({
        display: 'none'
    });
});

// 사용 범위를 위해 전역 변수 files 선언
let files;
// 게시글 추가 버튼 이벤트 처리
$('#nav_bar_add_box').click(function () {
    // +버튼을 누르면 업로드 창(첫 번째 모달창)이뜨게 함
    $('#first_modal').css({
        display: 'flex'
    });

    // 업로드 창이 떴을때 스크롤이 사라지게 함
    $(document.body).css({
        overflow: 'hidden'
    });
});

// 피드 공유하기 버튼 클릭시 이벤트 처리
$('#feed_create_button').click(function () {
    // 전역 변수에 저장된 파일을 가져옴
    let file = files[0];
    // 전역 변수에서 저장된 파일의 이름을 가져옴
    let image = files[0].name;
    // 글내용 입력란에서 글내용을 가져옴
    let content = $('#input_feed_content').val();
    // 해시태그 입력란에서 해시태그 내용을 가져옴
    let hashtags_content = $('#input_feed_hashtag').val();
    //정유진: 카테고리 정보 추가
    let category = $('#input_feed_category').val();

    // 피드 내용의 길이가 0보다 작으면 알림창 뜸
    if (content.length <= 0) {
        alert("피드 내용을 입력하세요");
        return 0;
    } else {
        // 정유진: 카테고리를 선택하지 않았을 때 알림창 뜸
        if (category == "") {
            alert("카테고리를 선택하세요");
            return 0;
        } else {
            alert("공유하기 눌렀다.");
        }
    }


    // 파일을 업로드 하는 것이므로 formdata 형태로 서버에 전달해야 함
    let fd = new FormData();
    // 폼데이터 객체에 서버로 전달된 데이터를 추가해 줌 (파일, 이미지이름, 글내용, 해시태그 내용)
    fd.append('file', file);
    fd.append('image', image);
    fd.append('content', content);
    fd.append('hashtags_content', hashtags_content);
    // 정유진: 카테고리 추가
    fd.append('category', category);

    //서버로 보낼 데이터 (formdata 형태)
    $.ajax({
        url: "/content/upload",
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
            location.replace("/main");
        }
    });
});

// 이미지 업로드 공간에 특정 이벤트 발생시 해당하는 함수를 실행
$('.img_upload_space')
    .on("dragover", dragOver)
    .on("dragleave", dragOver)
    .on("drop", uploadFiles)
    .on("change", uploadFiles)


// 마우스를 드래그 했을 때
function dragOver(e) {
    // 이벤트 전파 차단
    e.stopPropagation();
    e.preventDefault();

    // TODO 이게 뭔지 모르겠음
    if (e.type === "dragover") {
        $(e.target).css({
            "outline-offset": "-20px"
        });
    } else {
        $(e.target).css({
            "outline-offset": "-10px"
        });
    }
}

// 파일을 드래그 한 상태에서 마우스가 드랍이 되었을 때
function uploadFiles(e) {
    // 이벤트 전파 차단
    e.stopPropagation();
    e.preventDefault();

    // 실질적으로 파일을 업로드 하는 부분
    e.dataTransfer = e.originalEvent.dataTransfer;
    files = e.target.files || e.dataTransfer.files;

    // 여러개의 파일을 한번에 올릴려고 하면 리턴
    if (files.length > 1) {
        alert('하나만 올려라.');
        return;
    }

    // 파일의 타입을 판별하고 이미지면 아래 로식을 실행
    if (files[0].type.match(/image.*/)) {

        // 이미지 업로드시 사진업로드 모달창 (첫 번째 모달창)을 가림
        $('#first_modal').css({
            display: 'none'
        });

        // 글 내용 작성 모달창(두 번째 모달창)을 띄움
        $('#second_modal').css({
            display: 'flex'
        });

        // 이미지 남은 영역 검색으로 처리
        $('.img_upload_space').css({
            background: '#e9e9e9'
        });

        // 업로드 창 배경을 업로드된 이미지로 변경
        $('.img_upload_space').css({
            "background-image": "url(" + window.URL.createObjectURL(files[0]) + ")",
            "outline": "none",
            "background-size": "contain",
            "background-repeat": "no-repeat",
            "background-position": "center"
        });
    } else { //이미지가 아닐 경우
        alert('이미지가 아닙니다.');
        return 0;
    }
}

// 모달창에서 사진 추가 버튼 클릭했을 시 (파일 시스템을 열어서 업로드 하는 경우)
$('#image_upload_btn').click(function () {
    $('#input_image_upload').click();
});

// 파일 입력 폼에서 변화 발생시 해당 함수가 실행(
function image_upload() {
    // 타입을 판별하고 이미지면 아래 로식을 실행
    if ($('#input_image_upload')[0].files[0].type.match(/image.*/)) {
        // 업로드 창 배경을 업로드된 이미지로 변경
        $('.img_upload_space').css({
            "background-image": "url(" + window.URL.createObjectURL($('#input_image_upload')[0].files[0]) + ")",
            "outline": "none",
            "background-size": "contain",
            "background-repeat": "no-repeat",
            "background-position": "center"
        });
    } else { // 파일이 이미지가 아닐 경우
        return 0;
    }
}