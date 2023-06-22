// 자동완성 모달창과 검색창의 아이디 값을 가져온다.
let auto_modal = document.getElementById('auto_modal').getAttribute("id");
let search_box = document.getElementById('search_box').getAttribute("id");

// 모달 바깥부분을 클릭하면 안 보에게 된다.
window.addEventListener('mouseup', function (event) {
    // 클릭한 곳의 id 값이 널이거나 auto_modal이 포함되어 있지 않거나 search_box이 포함되어 있지 않으면 창을 안 보이게 설정
    if ((event.target.getAttribute("id") == null) || !((event.target.getAttribute("id").includes(auto_modal)) || (event.target.getAttribute("id").includes(search_box)))) {
        $('#auto_modal').css({
            display: 'none'
        });
    }
});

// 검색 자동완성 모달창 반응형 적용, 브라우저 창이 줄어들게 될 경우 아래 코드를 실행
window.addEventListener('resize', function () {
    // search_box라는 id를 가진 요소를 가져옴
    let search_box = document.getElementById('search_box');
    //  해당 요소의 위치 값 구함
    let rect = search_box.getBoundingClientRect();
    // 요소 값들 중에서 left 요소의 값을 구함
    let left_value = rect.left;
    // 검색창이 없을 경우 (left_value가 0이됨)
    if (left_value == 0) {
        $('#auto_modal').css({
            display: 'none'
        });
    } else { // 검색창이 있을 경우 줄어드는 크기에 맞춰서 이동시킴
        $('#auto_modal').css({
            left: left_value + 'px'
        });
    }
});

// 검색창을 클릭하면 자동완성 모달창이 뜬다(이미 창이 줄었을 경우 그때 검색창을 클릭하게 된다면 해당 위치에 보여줘야 함)
var typingTimer; // 정유진: 타이머 변수.
var doneTypingInterval = 700; // 정유진: 작동할 시간 간격. 1000 = 1초
$('#search_box').mousedown(function () {
    // search_box라는 id를 가진 요소를 가져옴
    let element = document.getElementById('search_box');
    //  해당 요소의 위치 값 구함
    let rect = element.getBoundingClientRect();
    // 요소 값들 중에서 left 요소의 값을 구함
    let left_value = rect.left;
    // 이동된 검색창 위치를 계산해서 검색창 바로 밑에 자동완성 창을 띄움
    $('#auto_modal').css({
        display: 'flex',
        left: left_value + 'px'
    });
    // 자동완성에 필요한 검색창의 값을 keyup 이벤트로 가져온다. TODO 시간차 텀
    $('#search_box').keyup(function () {
        // 이전 타이머 제거. 이전에 입력된 값이 서버에 안 보내지 않고 제거.
        clearTimeout(typingTimer);
        typingTimer = setTimeout(function () {
            let search_box_value = document.getElementById('search_box').value;
            // 해시태그 검색 시 #만 있거나 아무것도 없으면 검색 안됨.
            if (search_box_value != "" & search_box_value != '#') {
                // 가져온 값을 서버로 보낸다.
                $.ajax({
                    url: "/content/autocomplete",
                    data: {
                        search_box_value: search_box_value
                    },
                    method: "GET",
                    // data에는 자동 완성에 필요한 검색어로 필터링된 유저의 객체 리스트와, 검색어로 필터링된 해시태그 리스트를 합친 prioritize_list 리스트가 존재
                    success: function (data) {
                        console.log("성공");
                        // 키 입력이 검색 키워드 변경으로 인해 새로운 자동완성 모달창 다시 만들어줘야 하기 위해서 모달창을 비움
                        $("#auto_modal_list").html('');
                        // 정유진: 해시태그 모음의 게시글 수
                        // prioritize_list 리스트에 있는 요소 수 만큼 반복
                        for (let i = 0; i < data['prioritize_list'].length; i++) {
                            // 사용자 검색 시(prioritize_list 리스트에 content의 정보가 없을 경우 -> 유저 검색)
                            if (data['prioritize_list'][i]['content'] == undefined) {
                                // prioritize_list 리스트에서 검색 키워드에 필터링된 유저 정보를 꺼냄 (이미지는 경로가 따로 있어야 한다.)
                                let user_profile_image = "/media/" + data['prioritize_list'][i].profile_image;
                                let user_nickname = data['prioritize_list'][i].nickname;
                                let user_name = data['prioritize_list'][i].name;

                                // 자동완성 모달창에 자동완성 목록을 만드는 과정
                                $("#auto_modal_list").append('<div id="auto_modal_object_' + i + '" class="movetoprofile auto_modal_object"></div>');

                                $("#auto_modal_object_" + i).append('<img id="' + user_nickname + '" class="box feed_profile_image auto_modal_image" src="' + user_profile_image + '">');
                                $("#auto_modal_object_" + i).append('<div id="auto_modal_nickname_name_' + i + '"></div>');

                                $("#auto_modal_nickname_name_" + i).append('<div id="' + user_nickname + '" class="auto_modal_text_object1">' + user_nickname + '</div>');
                                $("#auto_modal_nickname_name_" + i).append('<div id="' + user_nickname + '" class="auto_modal_text_object2">' + user_name + '</div>');

                                // 정유진: append에서 id 값을 user_nickname로 하면 $("#" + user_nickname).append가 되지 않아 따로 바꾼다.
                                // 자동완성 목록에서 닉네임, 프로필 사진, 이름 뿐만 아니라 나머지 빈 영역을 클릭해도 프로필로 이동이 되더야 하기 때문에 id를 유저 닉네임으로 변경 해줘야 함
                                document.getElementById("auto_modal_object_" + i).setAttribute("id", user_nickname);
                            }
                            // 해시태그 검색 시
                            else {
                                // prioritize_list 리스트에서 검색 키워드에 필터링된 해시태그 정보를 꺼냄
                                let hashtag_content = data['prioritize_list'][i].content;
                                let hashtag_count = data['prioritize_list'][i].hashtag_count;
                                let hashtag_bundle_count = data['prioritize_list'][i].hashtag_bundle_count;

                                // 자동완성 모달창에 자동완성 목록을 만드는 과정
                                // 정유진: 가장 앞에 만들기 위해서.
                                if (i == 0) {
                                    search_box_value = search_box_value.replace('#', '')
                                    $("#auto_modal_list").append('<div id="auto_modal_object_bundle" class="hashtags auto_modal_object" hashtag_content="' + search_box_value + '모음보기"></div>');
                                    $("#auto_modal_object_bundle").append('<span class="auto_modal_hashtag_icon material-symbols-outlined" hashtag_content="' + search_box_value + '모음보기">tag</span>');
                                    $("#auto_modal_object_bundle").append('<div id="auto_modal_hashtag_bundle"></div>');

                                    $("#auto_modal_hashtag_bundle").append('<div class="auto_modal_text_object1" hashtag_content="' + search_box_value + '모음보기">' + search_box_value + ' 모음보기</div>');
                                    $("#auto_modal_hashtag_bundle").append('<div class="auto_modal_text_object2" hashtag_content="' + search_box_value + '">게시물 ' + hashtag_count + '</div>');
                                } else {
                                    $("#auto_modal_list").append('<div id="auto_modal_object_' + i + '" class="hashtags auto_modal_object" hashtag_content="' + hashtag_content + '"></div>');
                                    $("#auto_modal_object_" + i).append('<span class="auto_modal_hashtag_icon material-symbols-outlined" hashtag_content="' + hashtag_content + '">tag</span>');
                                    $("#auto_modal_object_" + i).append('<div id="auto_modal_hashtag_' + i + '"></div>');

                                    $("#auto_modal_hashtag_" + i).append('<div class="auto_modal_text_object1" hashtag_content="' + hashtag_content + '"> #' + hashtag_content + '</div>');
                                    $("#auto_modal_hashtag_" + i).append('<div class="auto_modal_text_object2" hashtag_content="' + hashtag_content + '">게시물 ' + hashtag_count + '</div>');
                                }
                            }
                        }

                        // 화면에서 다른 사용자의 프로필 클릭시 해당 사용자의 프로필로 이동
                        $(".movetoprofile").click(function (event) {
                            let user_nickname = event.target.id;
                            location.href = "/user/reprofile?user_nickname=" + user_nickname;
                        });
                        // 해시태그 클릭시 해시태그 검색이 실행 됨
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
            } else {
                $("#auto_modal_list").html('');
            }
        }, doneTypingInterval);
    });
});


//채팅할 친구 목록 모달창 여는 이벤트 처리 ajax
var ajax_call1 = function (url) {
    var request = $.ajax({
        url: url, // 요청할 url
        method: 'GET', // 요청 방식
        contentType: 'application/text',  // 서버로 전송되는 데이터 형태
    });

    return request;
};

// 채팅할 친구 목록 모달창 이벤트 처리 함수
var open_article1 = function (url) {
    ajax_call1(url).done(function (text) { // ajax 요청이 완료된 경우
        document.querySelector('.chat_modal_user_area').innerHTML = text; // 채팅 유저 모달창 내용을 서버로부터 받은 내용으로 셋팅
        document.getElementById('chat_modal_id').style.display = 'none'; // 채팅 모달창을 none로 설정
        document.getElementById('chat_user_modal_id').style.display = 'flex';
        // 토글 방식을 이용함 ( document.getElementById('').style.display = 'flex'; 가 이미 있는데 아래 코드를 작성하면 작동 x

        // 채팅 유저 목록 불러오기 알람 관련 js 코드
        // 새로운 <div> 요소를 생성하여 toastElement 변수에 할당합니다.
        var toastElement = document.createElement("div");
        // chat_alarm 클래스를 toastElement 요소에 추가합니다. 이를 통해 CSS 스타일이 적용될 수 있습니다.
        toastElement.classList.add("chat_user_alarm");
        // 알림창에 표시될 텍스트를 설정합니다.
        toastElement.textContent = "새로고침이 되었습니다";
        // toastElement를 <body> 요소에 추가합니다. 이로써 알림창이 화면에 표시됩니다.
        document.body.appendChild(toastElement);
        // 2초 후에 실행되는 함수를 설정합니다.
        setTimeout(function () {
            // toastElement의 스타일 속성을 수정하여 fadeOut 애니메이션을 적용하고, 알림창이 사라지도록 설정합니다.
            toastElement.style.animation = "fadeOut 2s forwards";
            // 2초 후에 실행되는 함수를 설정합니다.
            setTimeout(function () {
                // toastElement를 DOM에서 제거하여 알림창을 완전히 사라지게 합니다.
                toastElement.remove();
            }, 2000);
        }, 2000);
    });
};

//채팅창 여는 이벤트 처리 ajax
var ajax_call2 = function (url, user_email) {
    console.log(user_email)
    var request = $.ajax({
        url: url, // 요청할 자원
        method: 'GET', // 요청 방식
        contentType: 'application/text',  // 서버로 전송되는 데이터 형태
        data: {
            user_email: user_email
        }
    });

    return request;
};

//채팅창 여는 이벤트 처리 함수
var open_article2 = function (url, user_email) {
    ajax_call2(url, user_email).done(function (text) { // ajax 요청이 완료된 경우
        document.querySelector('.chat_modal_text_area').innerHTML = text; // 채팅 모달창 내용을 서버로부터 받은 내용으로 셋팅
        document.getElementById('chat_modal_id').style.display = 'flex'; // 채팅 모달창을 flex로 설정하여 보여줌
        document.getElementById('chat_user_modal_id').style.display = 'none'; // 채팅 유저 목록 모달창을 none로 설정
        // 채팅 스크롤 젤 아래로
        $('.chat_modal_content_area').scrollTop($('.chat_modal_content_area')[0].scrollHeight);

        // 채팅 불러오기 알람 관련 js 코드
        // 새로운 <div> 요소를 생성하여 toastElement 변수에 할당합니다.
        var toastElement = document.createElement("div");
        // chat_alarm 클래스를 toastElement 요소에 추가합니다. 이를 통해 CSS 스타일이 적용될 수 있습니다.
        toastElement.classList.add("chat_alarm");
        // 알림창에 표시될 텍스트를 설정합니다.
        toastElement.textContent = "채팅을 불러왔습니다.";
        // toastElement를 <body> 요소에 추가합니다. 이로써 알림창이 화면에 표시됩니다.
        document.body.appendChild(toastElement);
        // 2초 후에 실행되는 함수를 설정합니다.
        setTimeout(function () {
            // toastElement의 스타일 속성을 수정하여 fadeOut 애니메이션을 적용하고, 알림창이 사라지도록 설정합니다.
            toastElement.style.animation = "fadeOut 2s forwards";
            // 2초 후에 실행되는 함수를 설정합니다.
            setTimeout(function () {
                // toastElement를 DOM에서 제거하여 알림창을 완전히 사라지게 합니다.
                toastElement.remove();
            }, 2000);
        }, 2000);

        // 채팅 업로드 버튼 이벤트 처리
        $(".upload_chat").click(function (event) {
            // 채팅 입력란에서 채팅 내용과 채팅을 받을 유저 정보를 가져옴
            let chat_content = $('#chat_text_box').val();
            let receive_chat_user = event.target.attributes.getNamedItem('receive_chat_user').value;

            // 채팅의 길이가 0보다 작으면 알림창 뜸
            if (chat_content.length <= 0) {
                alert("채팅을 입력하세요");
                return 0;
            }
            $.ajax({
                url: "/user/chatting",
                data: {
                    chat_content: chat_content,
                    receive_chat_user: receive_chat_user,
                },
                method: "POST",
                success: function (data) {
                    console.log("성공");
                    // 채팅 비동기 전송을 위한 코드 TODO help
                    $('.chat_modal_content_area').append("<div class='send_chat_area'>" +
                        "<span class='send_chat'>" + data.chat_content + "</span>" +
                        "</div>");
                    // 스크롤을 최하단으로 이동( 입력되고 스크롤을 아래로 이동해야 최하단으로 이동됩니다.)
                    $('.chat_modal_content_area').scrollTop($('.chat_modal_content_area')[0].scrollHeight);
                },
                error: function (request, status, error) {
                    console.log("에러");
                },
                complete: function () {
                    console.log("완료");
                    // 댓글을 입력하고 나면 댓글 입력 폼을 비워야 함.
                    $('#chat_text_box').val('');
                }
            });
        });
        // 채팅 화면에서 다른 사용자의 프로필 클릭시 해당 사용자의 프로필로 이동
        $(".movetoprofile").click(function (event) {
            let user_nickname = event.target.id;
            location.href = "/user/reprofile?user_nickname=" + user_nickname;
        });
    });
};

// 채팅 유저 목록 모달창 드래그로 이동하는 코드, 문서가 로드되면 실행할 함수.
$(document).ready(function () {
    // 채팅 유저 모달과 헤더를 jQuery 객체로 가져온 후, 마우스 오프셋과 드래그 상태 변수를 선언합니다.
    var modal = $('.chat_user_modal_area');
    var modalHeader = $('.chat_user_modal_header');
    var mouseOffset = {x: 0, y: 0};
    var isDragging = false;

    // 모달 헤더를 마우스로 클릭할 때, 드래그 시작으로 설정하고 오프셋 값을 계산합니다.
    modalHeader.mousedown(function (e) {
        isDragging = true;
        mouseOffset = {x: e.pageX - modal.offset().left, y: e.pageY - modal.offset().top};
        e.preventDefault(); // 기본 브라우저 드래그 기능을 비활성화합니다.
    });

    // 문서에서 마우스 버튼을 놓을 때, 드래그가 끝난 상태로 설정하고 onDragEnd() 함수를 실행합니다.
    $(document).mouseup(function () {
        if (isDragging) {
            isDragging = false;
            onDragEnd();
        }
    });

    // 문서에서 마우스를 움직일 때, 드래그 동작 중일 경우 모달의 위치를 변경합니다.
    $(document).mousemove(function (e) {
        if (isDragging) {
            modal.offset({
                top: e.pageY - mouseOffset.y,
                left: e.pageX - mouseOffset.x
            });
        }
    });

    // 모달에서 마우스가 벗어날 때, 드래그 상태를 false로 설정합니다.
    modal.mouseleave(function () {
        isDragging = false;
    });

    // 드래그가 끝나면, chat_modal_id 요소의 위치를 업데이트하는 onDragEnd() 함수를 정의합니다.
    function onDragEnd() {
        let chatUserModal = modal[0]; // jQuery 객체에서 DOM 객체를 가져옵니다.
        let rect = chatUserModal.getBoundingClientRect();
        let left_value = rect.left;
        let top_value = rect.top;

        let chat_modal = document.getElementById('chat_modal_id');
        chat_modal.style.left = left_value + 'px';
        chat_modal.style.top = top_value + 'px';
    }
});

// 채팅창 모달창 드래그로 이동하는 코드 문서가 로드되면 실행할 함수.
$(document).ready(function () {
    // 채팅 모달과 헤더를 jQuery 객체로 가져온 후, 마우스 오프셋과 드래그 상태 변수를 선언합니다.
    var modal = $('.chat_modal_area');
    var modalHeader = $('.chat_modal_header');
    var mouseOffset = {x: 0, y: 0};
    var isDragging = false;

    // 모달 헤더를 마우스로 클릭할 때, 드래그 시작으로 설정하고 오프셋 값을 계산합니다.
    modalHeader.mousedown(function (e) {
        isDragging = true;
        mouseOffset = {x: e.pageX - modal.offset().left, y: e.pageY - modal.offset().top};
        e.preventDefault(); // 기본 브라우저 드래그 기능을 비활성화합니다.
    });

    // 문서에서 마우스 버튼을 놓을 때, 드래그가 끝난 상태로 설정하고 onDragEnd() 함수를 실행합니다.
    $(document).mouseup(function () {
        if (isDragging) {
            isDragging = false;
            onDragEnd();
        }
    });

    // 문서에서 마우스를 움직일 때, 드래그 동작 중일 경우 모달의 위치를 변경합니다.
    $(document).mousemove(function (e) {
        if (isDragging) {
            modal.offset({
                top: e.pageY - mouseOffset.y,
                left: e.pageX - mouseOffset.x
            });
        }
    });

    // 모달에서 마우스가 벗어날 때, 드래그 상태를 false로 설정합니다.
    modal.mouseleave(function () {
        isDragging = false;
    });

    // 드래그가 끝나면, chat_user_modal_id 요소의 위치를 업데이트하는 onDragEnd() 함수를 정의합니다.
    function onDragEnd() {
        let chatModal = modal[0]; // jQuery 객체에서 DOM 객체를 가져옵니다.
        let rect = chatModal.getBoundingClientRect();
        let left_value = rect.left;
        let top_value = rect.top;

        let chat_user_modal = document.getElementById('chat_user_modal_id');
        chat_user_modal.style.left = left_value + 'px';
        chat_user_modal.style.top = top_value + 'px';
    }
});


// 채팅 모달창 닫기 버튼 이벤트 처리 (클래스명으로 해야함 why? TODO)
$(".chat_modal_close").click(function () {
    // 채팅 모달창 숨김, 채팅 모달창 위치 초기화
    $('#chat_modal_id').css({
        display: 'none',
        top: '100px',
        left: 'calc(50% - -100px)',
    });
    // 채팅 유저 목록 모달창 숨김, 채팅 유저 목록 모달창 위치 초기화
    $('#chat_user_modal_id').css({
        display: 'none',
        top: '100px',
        left: 'calc(50% - -100px)',
    });
});


// 알림 목록 모달창 여는 이벤트 처리 ajax
var ajax_call3 = function (url) {
    var request = $.ajax({
        url: url, // 요청할 url
        method: 'GET', // 요청 방식
        contentType: 'application/text',  // 서버로 전송되는 데이터 형태
    });

    return request;
};

// 알림 목록 모달창 이벤트 처리 함수
var open_article3 = function (url) {
    ajax_call3(url).done(function (text) { // ajax 요청이 완료된 경우
        document.querySelector('.alert_list_modal_area').innerHTML = text; // 채팅 유저 모달창 내용을 서버로부터 받은 내용으로 셋팅
        // 토글 방식으로 열고 닫음
        var alertModal = document.getElementById('alert_modal_id');
        if (alertModal.style.display === 'flex') {
            alertModal.style.display = 'none';
        } else {
            alertModal.style.display = 'flex';
        }

        // 알람 확인시 해당 게시물로 이동
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
                    var is_shared_category = data['is_shared_category'];
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
                            '<span id="feed_modla_favorite_' + feed_id + '" feed_id="' + feed_id + '" feed_user_nickname="' + writer_nickname + '"  style="color: red" class="uTrue favorite material-symbols-outlined">favorite</span>');
                    else
                        $("#feed_modal_is_liked").html(
                            '<span id="feed_modla_favorite_' + feed_id + '" feed_id="' + feed_id + '" feed_user_nickname="' + writer_nickname + '" class="uFalse favorite material-symbols-outlined">favorite</span>');

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
                    document.getElementById("reply_content_upload").setAttribute("feed_user_nickname", writer_nickname);

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
                        // 피드의 작성자 닉네임
                        let feed_user_nickname = event.target.attributes.getNamedItem('feed_user_nickname').value;

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
                                favorite_color: favorite_color,
                                feed_user_nickname: feed_user_nickname
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

        // 알람 화면에서 다른 사용자의 프로필 클릭시 해당 사용자의 프로필로 이동 (피드모달과 프로필 이동클래스명이 같아 오류)
        $(".alertprofile_move").click(function (event) {
            let user_nickname = $(this).attr("alert_id");
            console.log(user_nickname);
            location.href = "/user/reprofile?user_nickname=" + user_nickname;
        });
    });
};

// 알람 모두 삭제 버튼 이벤트 처리
$(".alert_all_remove").click(function (event) {
    // 알림 삭제 버튼 내용을 가져옴
    var remove_message = $(".alert_all_remove").html().trim();
    // 알람 일괄 삭제 알람 관련 js 코드
    // 새로운 <div> 요소를 생성하여 toastElement 변수에 할당합니다.
    var toastElement = document.createElement("div");
    // alert_alarm 클래스를 toastElement 요소에 추가합니다. 이를 통해 CSS 스타일이 적용될 수 있습니다.
    toastElement.classList.add("alert_alarm");
    // 알림창에 표시될 텍스트를 설정합니다.
    toastElement.textContent = "알림을 모두 확인했습니다.";
    // toastElement를 <body> 요소에 추가합니다. 이로써 알림창이 화면에 표시됩니다.
    document.body.appendChild(toastElement);
    // 2초 후에 실행되는 함수를 설정합니다.
    setTimeout(function () {
        // toastElement의 스타일 속성을 수정하여 fadeOut 애니메이션을 적용하고, 알림창이 사라지도록 설정합니다.
        toastElement.style.animation = "fadeOut 2s forwards";
        // 2초 후에 실행되는 함수를 설정합니다.
        setTimeout(function () {
            // toastElement를 DOM에서 제거하여 알림창을 완전히 사라지게 합니다.
            toastElement.remove();
        }, 2000);
    }, 2000);

    $.ajax({
        url: "/user/alert",
        data: {
            remove_message: remove_message
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


// 검색창에 아무것도 입력되지 않았을 때 이벤트 처리
window.onload = function () {
    document.getElementById("search_bar").addEventListener("submit", function (event) {
        event.preventDefault(); // 기본 폼 제출 동작 취소
        if (document.getElementById("search_box").value === "") {
            alert("검색어를 입력하세요.");
        } else {
            this.submit(); // 폼 실행
        }
    });
};