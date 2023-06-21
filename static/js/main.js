$(".movetoprofile").click(function (event) {
    // 이벤트가 발생한 태그의 id를 가져옴 id는 user_nickname 형태
    let user_nickname = event.target.id;
    // 해당 url로 요청하게 되면 매핑된 view도 실행되고 url뒤에 데이터를 붙여서 전송이 가능하다.
    location.href = "/user/reprofile?user_nickname=" + user_nickname;
});

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

        // 좋아요 관련 ajax 호출
        $.ajax({
            url: "/content/like",
            data: {
                feed_id: feed_id,
                favorite_color: favorite_color,
                feed_user_nickname: feed_user_nickname,
            },
            method: "POST",
            success: function (data) {
                // data에는 사용자가 좋아요를 누르고 테이블에 값이 저장되었으니 그 이후에 수를 계산한 값이 들어있다.
                console.log("성공");
                // 좋아요 수를 비동기로 처리
                var async_like_count = data['async_like_count'];
                $("#async_like_count_" + feed_id).html(async_like_count + '명');
            },
            error: function (request, status, error) {
                console.log("에러");
            },
            complete: function () {
                console.log("완료");

            }
        });
    });
})

// 댓글 게시 버튼 이벤트 처리
$(".upload_reply").click(function (event) {
    // 게시 버튼 태그의 feed_id 속성 값을 가져옴 ( 피드는 여러개이므로 어떤 피드에 댓글을 게시 했는지 알아야함 )
    let feed_id = event.target.attributes.getNamedItem('feed_id').value;
    // 각 댓글이 몇번 피드에 입력됐는지 구분하기 위해서 아래 처럼 저장 -> 결국 댓글 입력폼 id임
    let reply_id = 'reply_' + feed_id;
    // 댓글 입력 폼의 아이디를 이용해서 입력 폼의 내용을 가져옴
    let reply_content = $('#' + reply_id).val();
    let feed_user_nickname = event.target.attributes.getNamedItem('feed_user_nickname').value;

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
            reply_content: reply_content,
            feed_user_nickname: feed_user_nickname,
        },
        method: "POST",
        success: function (data) {
            // 비동기식 댓글 업로드를 위한 구현 data에는 댓글을 쓴 유저의 정보가 들어있다
            console.log("성공");

            // 댓글 리스트(댓글들, 댓글 입력 박스)
            $("#reply_list_" + feed_id).append('<div id="feed_reply_list_area_' + data.user_reply_id + '" class="user_reply_list_area"></div>');

            // <부모 : 댓글 한 줄 영역> append <자식 : 닉네임과 댓글 내용>
            $("#feed_reply_list_area_" + data.user_reply_id).append('<div id="feed_user_reply_' + data.user_reply_id + '" class="user_reply text_line" style="display: flex"></div>');
            // <부모 : 댓글 한 줄 영역> append <자식 : 댓글 수정 메뉴>
            $("#feed_reply_list_area_" + data.user_reply_id).append('<div><div id="reply_menu' + data.user_reply_id + '" reply_id="' + data.user_reply_id + '" class="dropdown" style="display: flex"></div></div>');

            // <부모 : 닉네임과 댓글 내용> append <자식 : 실제 닉네임과 댓글 내용 값>
            $("#feed_user_reply_" + data.user_reply_id).append('<b class="movetoprofile reply_nickname" id="' + data.user_nickname + '" style="margin-right: 10px;">' + data.user_nickname + '</b>' + reply_content);

            // <부모 : 댓글 수정 메뉴> append <자식 : 댓글 수정 아이콘>
            $("#reply_menu" + data.user_reply_id).append('' +
                '<a href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">' + '<span class="material-icons-round">more_horiz</span>' + '</a>');
            // <부모 : 댓글 수정 아이콘> append <자식 : 댓글 삭제 수정 메뉴>
            $("#reply_menu" + data.user_reply_id).append('' +
                '<ul id="reply_delete_update_menu" class="dropdown-menu" aria-labelledby="dropdownMenuLink">' + '<li reply_id="' + data.user_reply_id + '" class="remove_reply dropdown-item">' + '<b class="delete_text">삭제</b>' + '</li>' + '<li>' + '<hr style="display: flex;"class="dropdown-divider">' + '</li>' + '<li style="display: flex">' +
                '<div id="' + data.user_reply_id + '" reply_id="' + data.user_reply_id + '" class="update_reply dropdown-item">수정</div>' + '</li>' + '</ul>');

            // <부모 : 댓글 리스트> append <자식 : 댓글 수정할 텍스트 박스 입력창, 수정창 닫기, 수정 버튼>
            $("#reply_list_" + feed_id).append('' +
                '<div class="reply_update_textbox" id="reply_div' + data.user_reply_id + '">' + '<input id="reply_update_' + data.user_reply_id + '" type="text" class="input_reply_update form-control" placeholder="댓글 수정..">' +
                '<div reply_id="' + data.user_reply_id + '" class="update_replys" id="update_reply_btn">' + '수정' +
                '</div>' + '<span reply_id="' + data.user_reply_id + '" id="reply_close_button" class="reply_close_btn material-icons-outlined">close</span>' + '</div>');

            // 비동기 화면에서 다른 사용자의 프로필 클릭시 해당 사용자의 프로필로 이동
            $(".movetoprofile").click(function (event) {
                let user_nickname = event.target.id;
                location.href = "/user/reprofile?user_nickname=" + user_nickname;
            });

            // 비동기 댓글 삭제 이벤트 처리
            $('.remove_reply').click(function (event) {
                // 삭제할 댓글 id를 가져옴
                var reply_id = $(this).attr('reply_id');

                // 서버로 보낼 데이터 json
                $.ajax({
                    url: "/content/removereply",
                    data: {
                        reply_id: reply_id,
                    },
                    method: "POST",
                    success: function (data) {
                        console.log("성공");
                        alert("댓글을 성공적으로 삭제 하었습니다.");
                    },
                    error: function (request, status, error) {
                        console.log("에러");
                    },
                    complete: function () {
                        console.log("완료");
                        location.reload();
                    }
                });
            })

            // 비동기 댓글 수정 메뉴 이벤트 처리
            $('.update_reply').click(function (event) {
                // 수정할 댓글 id를 가져옴
                let reply_id = $(this).attr('reply_id');
                // 댓글 수정영역을 보여줌
                $('#reply_div' + reply_id).css({
                    display: 'flex'
                });
                // 댓글 수정 아이콘을 가림
                $('#reply_menu_' + reply_id).css({
                    display: 'none'
                });
            });

            // 비동기 댓글 수정 취소 버튼 이벤트 처리
            $('.reply_close_btn').click(function (event) {
                // 수정 취소 버튼의 id값을 가져옴
                let reply_id = $(this).attr('reply_id');
                //댓글 수정영역을 가림
                $('#reply_div' + reply_id).css({
                    display: 'none'
                });
                // 댓글 수정 아이콘을 다시 보여줌
                $('#reply_menu_' + reply_id).css({
                    display: 'flex'
                });
            });


            // 비동기 댓글 수정하기를 눌렸을 때 이벤트 처리
            $('.update_replys').click(function (event) {
                // 수정할 댓글의 id를 가져옴
                let reply_id = $(this).attr('reply_id');
                // 댓글 수정 입력박스에 입력된 내용을 가져옴
                let content = $('#reply_update_' + reply_id).val();


                // 댓글의 길이가 0보다 작으면 알림창 뜸
                if (content.length <= 0) {
                    alert("댓글을 입력하세요");
                    return 0;
                }

                //서버로 보낼 데이터 (json 형태)
                $.ajax({
                    url: "/content/updatereply",
                    data: {
                        reply_id: reply_id,
                        content: content
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
                        location.reload();
                    }
                });
            });
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            // 댓글을 입력하고 나면 댓글 입력 폼을 비워야 함
            $('#' + reply_id).val('');
        }
    });

});

// 피드 삭제 이벤트 처리
$('.remove_feed').click(function (event) {
    // 삭제할 피드의 id를 가져옴
    var feed_id = $(this).attr('feed_id');

    //서버로 보낼 데이터 (json 형태)
    $.ajax({
        url: "/content/removefeed",
        data: {
            feed_id: feed_id
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            alert("피드를 성공적으로 삭제 되었습니다.");
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            location.reload();
        }
    });
})

// 댓글 삭제 이벤트 처리
$('.remove_reply').click(function (event) {
    // 삭제할 피드의 id를 가져옴
    var reply_id = $(this).attr('reply_id');

    //서버로 보낼 데이터 (json 형태)
    $.ajax({
        url: "/content/removereply",
        data: {
            reply_id: reply_id,
        },
        method: "POST",
        success: function (data) {
            console.log("성공");
            alert("댓글을 성공적으로 삭제 하었습니다.");
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            location.reload();
        }
    });
})

// 피드 수정하기 메뉴 클릭 이벤트 처리
$('.update_feed').click(function (event) {
    // 피드 수정 이벤트가 발생한 피드의 feed_id 속성 값을 가져옴
    Feeds_id = event.target.attributes.getNamedItem('feed_id').value;
    // 피드 수정창을 보여줌
    $('#third_modal').css({
        display: 'flex'
    });
    // 이미지 남은 영역 검은색으로 처리
    $('#update_feed_modal_image').css({
        background: '#e9e9e9'
    });
    let img_count = 0
    let now_img_count = 0
    let imgs_list = []

    //서버로 보낼 데이터 (json 형태)
    $.ajax({
        url: "/content/feedupdateimg",
        data: {
            feed_id: Feeds_id
        },
        method: "GET",
        success: function (data) {
            console.log("성공");
            // 서버에서 받은 게시물 이미지, 내용, 작성자 프로필 이미지, 작성자 닉네임 변수에 따로 할당.
            let count = data['count'];
            let imgs = data['image[]'];
            files = imgs
            let feed_content = data['feed_content'];
            let hashtag_content = data['hashtag_content']
            imgs_list = imgs
            // 정유진: 카테고리 추가
            var category = data['category']
            // 정유진: 공유카테고리 추가
            var shared_category = data['shared_category']

            // 업로드 창 이미지 부분 배경을 업로드된 이미지로 변경
            $('#update_feed_modal_image').css({
                "background-image": "url(" + "/media/" + imgs[0] + ")",
                "outline": "none",
                "background-size": "contain",
                "background-repeat": "no-repeat",
                "background-position": "center",
                "margin-right": "1px"
            });
            // 사진이 1장뿐이라면 좌우 버튼이랑 이미지 삭제 버튼을 숨김
            if (count == 1) {
                $('.update_feed_modal_image_LR_btns').css({
                    "display": "none"
                })
                $('.update_feed_modal_feed_image_dele').css({
                    "display": "none"
                })
            } else {
                $('.update_feed_modal_image_LR_btns').css({
                    "display": "flex"
                })
                $('.update_feed_modal_feed_image_dele').css({
                    "display": "flex"
                })
            }
            img_count = count
            // 할당 받은 게시물 내용, 해시태그들을 모달창에 추가
            $("#input_updatefeed_content").html(feed_content);
            $("#input_updatefeed_hashtag").html(hashtag_content);
            // 정유진: 모달창 띄울 때 현재 적용된 카테고리 종류가 나오도록 한다
            var selectElement = document.getElementById('input_updatefeed_category');
            var selectedOption = document.getElementById('category_' + category);
            selectedOption.selected = true;
            // 정유진: 바로 적용이 되지 않으면 selectedIndex를 사용해야 한다
            selectElement.selectedIndex = selectedOption.index;
            // 정유진: 모달창 띄울 때 현재 선택된 유저가 나오도록 한다
            for (var i = 0; i < shared_category.length; i++) {
                $("#update_shared_user_nickname_" + shared_category[i]).prop('checked', true);
            }
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");

        }
    });
    // 피드 수정하기 에서 이미지 이전 버튼 이밴트
    $('.update_feed_modal_feed_image_before').click(function () {
        if (now_img_count == 0) {
            $('#update_feed_modal_image').css({
                "background-image": "url(" + "/media/" + imgs_list[img_count - 1] + ")"
            });
            now_img_count = img_count - 1
        } else {
            $('#update_feed_modal_image').css({
                "background-image": "url(" + "/media/" + imgs_list[now_img_count - 1] + ")"
            });
            now_img_count--
        }
    });
    // 피드 수정하기 에서 이미지 다음 버튼 이밴트
    $('.update_feed_modal_feed_image_next').click(function () {
        if (now_img_count == img_count - 1) {
            $('#update_feed_modal_image').css({
                "background-image": "url(" + "/media/" + imgs_list[0] + ")"
            });
            now_img_count = 0
        } else {
            $('#update_feed_modal_image').css({
                "background-image": "url(" + "/media/" + imgs_list[now_img_count + 1] + ")"
            });
            now_img_count++
        }
    });
    //  피드 수정하기 에서 이미지 삭제 버튼 이밴트
    $('.update_feed_modal_feed_image_dele').click(function () {
        //서버로 보낼 데이터 (json 형태)
        $.ajax({
            url: "/content/removeimg",
            data: {
                now_img_count: parseInt(now_img_count),
                img_content: imgs_list[now_img_count],
                img_feed_id: Feeds_id
            },
            method: "POST",
            success: function (data) {
                console.log("성공");
                // 유재우 : 새로고침대신 넣은 닫기 버튼 본인 컴퓨터에서 닫기 버튼을 눌르는게 아닌 새로고침을 하게 될 경우 새로고침이 되기 전 피드가 클릭되는 현상이 발생하였고 그것을 방지하기 위함과 초기화를 위해서임
                $('.modal_close_button').click()
            },
            error: function (request, status, error) {
                console.log("에러");
            },
            complete: function () {
                console.log("완료");
                $('#' + Feeds_id + '_update_feed_btn').click()
            }
        });
    })
});
// 피드 수정창을 닫을 경우 여러가지 값이 초기화가 안되며, 파일쪽에 오류가 발생하는 것을 방지하기 위해서 모달창을 닫을 시 새로고침
$('.update_feed_modal_close').click(function () {
    $('.third_modal').css(
        {
            display: 'none'
        }
    )
    location.reload()
})

// 피드 수정하기 모달에서 수정하기 버튼 클릭 이벤트 처리
$('#feed_update_button').click(function (event) {
    // 수정할 피드의 feed_id를 전역변수에서 가져오고, 해시태그 내용, 글 내용은 각각 입력 폼에서 가져옴
    let feed_id = Feeds_id
    let hashtag_content = $('#input_updatefeed_hashtag').val();
    let content = $('#input_updatefeed_content').val();
    let category = $('#input_updatefeed_category').val();
    var shared_categories = document.querySelectorAll("input[name='update_shared_category_nickname_list']:checked");
    let shared_category_list = []
    for (var i = 0; i < shared_categories.length; i++) {
        shared_category_list.push(shared_categories[i].value)
    }
    // 서버로 보낼 (json 형태)
    $.ajax({
        url: "/content/updatefeed",
        data: {
            feed_id: feed_id,
            content: content,
            hashtag_content: hashtag_content,
            category: category,
            shared_category_list: shared_category_list
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
            location.replace("/main");
        }
    });
});

// 댓글 수정하기 메뉴 이벤트 처리
$('.update_reply').click(function (event) {
    //수정할 댓글의 id를 가져옴
    let reply_id = $(this).attr('reply_id');
    // 댓글 수정영역을 보여줌
    $('#reply_div' + reply_id).css({
        display: 'flex'
    });
    // 댓글 수정 아이콘을 가림
    $('#reply_menu_' + reply_id).css({
        display: 'none'
    });
});

// 댓글 수정하기 취소 버튼
$('.reply_close_btn').click(function (event) {
    // 수정 취소 버튼의 id값을 가져옴
    let reply_id = $(this).attr('reply_id');
    //댓글 수정영역을 가림
    $('#reply_div' + reply_id).css({
        display: 'none'
    });
    // 댓글 수정 아이콘을 다시 보여줌
    $('#reply_menu_' + reply_id).css({
        display: 'flex'
    });
});

// 댓글 수정하기를 눌렸을 때 이벤트 처리
$('.update_replys').click(function (event) {
    // 수정할 댓글의 id를 가져옴
    let reply_id = $(this).attr('reply_id');
    // 댓글 수정 입력박스에 입력된 내용을 가져옴
    let content = $('#reply_update_' + reply_id).val();


    // 댓글의 길이가 0보다 작으면 알림창 뜸
    if (content.length <= 0) {
        alert("댓글을 입력하세요");
        return 0;
    }

    //서버로 보낼 데이터 (json 형태)
    $.ajax({
        url: "/content/updatereply",
        data: {
            reply_id: reply_id,
            content: content
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
            location.reload();
        }
    });
});


// 피드 내용 더보기 이벤트 처리
$('.feed_content_more').click(function (event) {
    // 피드 내용 더보기 클릭 이벤트가 발생한 피드의 id를 가져옴
    let feed_id = event.target.id;
    // 해당 feed_id 값을 가진 피드의 닉네임 속성을 가져옴
    let feed_nickname = document.getElementById(feed_id).getAttribute("feed_nickname");
    // 해당 feed_id 값을 가진 피드의 글 내용 속성을 가져옴
    let feed_content_more = document.getElementById(feed_id).getAttribute("feed_content");

    // 피드 글 내용 태그의 본문에 피드의 글내용을 일부분에서 모두 보기로 변경 ( 원래는 10글자만 보여준 상태 -> 다 보여줌 )
    // 피드 글 내용 태그의 본문에 피드 작성자 닉네임과 글내용으로 채움
    $('#feed_content_limit_' + feed_id).html('<b class="movetoprofile feed_content_nickname" style="margin-right: 6px" id="' + feed_nickname + '">' + feed_nickname + '</b>' + feed_content_more)

    // 특정 feed_id를 가진 피드의 더 보기 클릭 시 해당 피드의 더보기 버튼 사라짐
    $('#' + feed_id).css({
        display: 'none'
    })
    // 더보기 클릭 시 해시태그 나타남
    $('#hashtag_div_' + feed_id).css({
        display: 'flex'
    })
    // 더보기 클릭시 해시태그와 글 내용 사이 공백을 나타냄
    $('#hashtag_space_div_' + feed_id).css({
        display: 'flex'
    })
    // 더보기 클릭시 해시태그와 글 내용 사이 공백을 나타냄
    $('#feed_category_' + feed_id).css({
        display: 'flex'
    })
});

// 해시태그를 눌렸을 때 해시태그를 검색함
$('.hashtags').click(function () {
    // 누른 해시태그의 해시태그 내용을 가져옴
    let hashtag_content = $(this).attr('hashtag_content');
    // 해시태그 내용 데이터를 검색 url 뒤에 붙여서 전달
    location.href = "/content/search/?search=%23" + hashtag_content
});


// 팔로우 스위치 버튼을 누른 경우
$('#flexSwitchCheckChecked').click(function (event) {
    // 기본 값은 unchecked 상태
    let is_checked = 'unchecked'
    // 만약 해당 태그의 checked 여부가 true면 is_checked에 checked를 저장한 뒤 서버로 보냄
    if ($(this).is(":checked") == true) {
        let is_checked = 'checked'
        // 팔로우 체크 했는지에 대한 정보를 서버로 보냄
        location.href = "/content/main?is_checked=" + is_checked;
    } else { // 해당 태그의 checked 여부가 false면 is_checked에 unchecked를 저장한 뒤 메인페이지로 이동
        let is_checked = 'unchecked'
        location.href = "/main";
    }
});


// 유재우: 매인에서 이미지 슬라이드를 위해 추가한 이밴트들
$('.prev_image_button').click(function (event) {
    let feed_id = event.target.attributes.getNamedItem('feed_ids').value;
    let feeds_id = parseInt(feed_id / 100)
    let now_img_id = parseInt((feed_id % 100) / 10)
    let last_img_id = parseInt(feed_id % 10) - 1

    if (now_img_id == 0) {
        $('#' + feeds_id + now_img_id + '_next_button').css({
            display: 'none'
        })
        $('#' + feeds_id + last_img_id + '_next_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_prev_button').css({
            display: 'none'
        })
        $('#' + feeds_id + last_img_id + '_prev_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + last_img_id + '_img').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_img').css({
            display: 'none'
        })
        $('#' + feeds_id + last_img_id + '_now_count').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_now_count').css({
            display: 'none'
        })
    } else {
        $('#' + feeds_id + now_img_id + '_next_button').css({
            display: 'none'
        })
        $('#' + feeds_id + (now_img_id - 1) + '_next_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_prev_button').css({
            display: 'none'
        })
        $('#' + feeds_id + (now_img_id - 1) + '_prev_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + (now_img_id - 1) + '_img').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_img').css({
            display: 'none'
        })
        $('#' + feeds_id + (now_img_id - 1) + '_now_count').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_now_count').css({
            display: 'none'
        })
    }
})

// 유재우: 매인에서 이미지 슬라이드를 위해 추가한 이밴트들
$('.next_image_button').click(function (event) {
    let feed_id = event.target.attributes.getNamedItem('feed_ids').value;
    let feeds_id = parseInt(feed_id / 100)
    let now_img_id = parseInt((feed_id % 100) / 10)
    let last_img_id = parseInt(feed_id % 10) - 1

    if (now_img_id == last_img_id) {
        $('#' + feeds_id + now_img_id + '_next_button').css({
            display: 'none'
        })
        $('#' + feeds_id + now_img_id + '_prev_button').css({
            display: 'none'
        })
        $('#' + feeds_id + 0 + '_next_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + 0 + '_prev_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + 0 + '_img').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_img').css({
            display: 'none'
        })
        $('#' + feeds_id + 0 + '_now_count').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_now_count').css({
            display: 'none'
        })
    } else {
        $('#' + feeds_id + now_img_id + '_next_button').css({
            display: 'none'
        })
        $('#' + feeds_id + now_img_id + '_prev_button').css({
            display: 'none'
        })
        $('#' + feeds_id + (now_img_id + 1) + '_next_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + (now_img_id + 1) + '_prev_button').css({
            display: 'flex'
        })
        $('#' + feeds_id + (now_img_id + 1) + '_img').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_img').css({
            display: 'none'
        })
        $('#' + feeds_id + (now_img_id + 1) + '_now_count').css({
            display: 'flex'
        })
        $('#' + feeds_id + now_img_id + '_now_count').css({
            display: 'none'
        })
    }
})


// 유재우 : 수정하기에 이미지 추가
function image_update(e) {
    let fd = new FormData();
    let fileInput = document.getElementById("update_feed_modal_input_image_upload");
    if (fileInput.files.length + files.length > 6) {
        alert("이미지 파일은 6장을 넘을 수 없습니다")
        return;
    }
    let file_length = fileInput.files.length
    let feed_id = Feeds_id

    for (let i = 0; i < fileInput.files.length; i++) {
        fd.append('file[' + i + ']', fileInput.files[i]);
        fd.append('image[' + i + ']', fileInput.files[i].name);
    }
    fd.append('file_length', file_length)
    fd.append('feed_id', feed_id)

    // 이미지를 Django 서버로 전송하는 AJAX 요청
    $.ajax({
        url: "/content/updateimages", // 이미지를 처리할 Django 뷰의 URL
        method: "POST",
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log("성공");
            $('.modal_close_button').click();
        },
        error: function (request, status, error) {
            console.log("에러");
        },
        complete: function () {
            console.log("완료");
            $('#' + feed_id + '_update_feed_btn').click()
        }
    });
}

// 유재우 : 피드 수정 모달창에서 사진 추가 버튼 클릭했을 시 (파일 시스템을 열어서 업로드 하는 경우)
$('.update_feed_modal_image_update').click(function () {
    $('.update_feed_modal_input_image_upload_btn').click()
});

// 팔로우 모두보기 모달창 이벤트 처리
const follow_recommend_list_all = document.querySelector(".follow_recommend_list_all");
const all_follow_recommend_list = document.querySelector(".all_follow_recommend_list");
const close_follow_modal = document.querySelector(".close_follow_modal");

// 팔로우 모두보기 클릭시 이벤트 처리
follow_recommend_list_all.addEventListener("click", () => {
    all_follow_recommend_list.style.display = "flex";
});

// 팔로우 모달창 닫기 버튼 이벤트 처리
close_follow_modal.addEventListener("click", () => {
    all_follow_recommend_list.style.display = "none";
    location.reload()
});


// 메인에서 팔로우 버튼을 클릭했을때 (모달창과 이벤트가 겹치면 오류가발생 )
$('.follow_button').click(function (event) {
    // 팔로우 당하는 사람의 이메일과 팔로우 버튼 id를 가져옴
    let user_email = $(this).attr("user_email");

    let follow_id = event.target.id;

    // 팔로우 버튼의 글 내용으로 팔로우 여부를 따지기 위해서 가져옴
    let is_followed = $.trim($('#' + follow_id).html());


    // 만약 팔로우 버튼의 글 내용이 팔로우일 경우 -> css토글
    if (is_followed == '팔로우') {
        $('#' + follow_id).html('언팔로우');
        $(this).css({
            color: 'gray',
            border: 'none',
        })
    } else { // 만약 팔로우 버튼의 글 내용이 언팔로우일 경우 -> css토글
        $('#' + follow_id).html('팔로우');
        $(this).css({
            color: 'rgb(0, 149, 246)',
            border: 'none',
        })

    }
    // 서버로 보낼 데이터 (json)
    $.ajax({
        url: "/user/follow",
        data: {
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
// 팔로우 모달창에서 팔로우 버튼을 클릭했을때 (모달창과 이벤트가 겹치면 오류가발생 )
$('.follow_modal_button').click(function (event) {
    // 팔로우 당하는 사람의 이메일과 팔로우 버튼 id를 가져옴
    let user_email = $(this).attr("user_email");

    let follow_id = event.target.id;

    // 팔로우 버튼의 글 내용으로 팔로우 여부를 따지기 위해서 가져옴
    let is_followed = $.trim($('#' + follow_id).html());


    // 만약 팔로우 버튼의 글 내용이 팔로우일 경우 -> css토글
    if (is_followed == '팔로우') {
        $('#' + follow_id).html('언팔로우');
        $(this).css({
            color: 'gray',
            border: 'none',
        })
    } else { // 만약 팔로우 버튼의 글 내용이 언팔로우일 경우 -> css토글
        $('#' + follow_id).html('팔로우');
        $(this).css({
            color: 'rgb(0, 149, 246)',
            border: 'none',
        })

    }
    // 서버로 보낼 데이터 (json)
    $.ajax({
        url: "/user/follow",
        data: {
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
