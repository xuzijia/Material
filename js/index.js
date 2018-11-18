/**
 * @description TODO
 * @author simple
 * @date 2018/11/8 10:40
 */

var app = new Vue({
    el: "#app",
    data: {
        message: "message",
        picObject: {
            currPage: 1,
            size: 18,
            picList: [],
            total: 0,
            selectCount: 0,
            isShow: false,
            selectList: [],
            totalPage: 0,
            beginPage: 1,
            endPage: 5
        },
        newsObject:{
            newsList:[],
            count:0,
            currPage: 1,
            size: 6,
            totalPage:0,
            beginPage:1,
            endPage:5,
            totalPage:0
        },
        baseUrl: "http://localhost:8080"
    },
    mounted() {
        //加载图文素材
        this.showNews();
    },
    methods: {
        showMedia() {
            var $this = this;
            $.ajax({
                url: this.baseUrl + "/model/material/find_all_media.json",
                data: {page: $this.picObject.currPage, size: $this.picObject.size},
                dataType: "json",
                success: function (res) {
                    console.log(res);
                    $this.picObject.isFirst = false;
                    if (res.code == 200) {
                        $this.picObject.picList = res.dataList;
                        $this.picObject.total = res.count;
                        $this.picObject.totalPage = Math.ceil($this.picObject.total / $this.picObject.size);
                        if ($this.picObject.totalPage < $this.picObject.endPage) {
                            $this.picObject.endPage = $this.picObject.totalPage;
                        }
                    }
                },
                error: function () {
                    alert("图片加载失败....");
                }
            })
        },
        showNews(){
            var $this = this;
            $.ajax({
                url: this.baseUrl + "/model/material/news_list.json",
                data: {page: $this.newsObject.currPage, size: $this.newsObject.size},
                dataType: "json",
                success: function (res) {
                    console.log(res);
                    if (res.code == 200) {
                        $this.newsObject.newsList = res.dataList;
                        $this.newsObject.count = res.count;
                        $this.newsObject.totalPage = Math.ceil($this.newsObject.count / $this.newsObject.size);
                        if ($this.newsObject.totalPage < $this.newsObject.endPage) {
                            $this.newsObject.endPage = $this.newsObject.totalPage;
                        }
                    }
                },
                error: function () {
                    alert("图文加载失败....");
                }
            })
        },
        upload() {
            $("#media").trigger("click");
        },
        uploadFile() {
            var $this = this;
            //创建formdata对象
            var formData = new FormData();
            $.each($('#media')[0].files, function (index, item) {
                formData.append("media", item);
            });
            formData.append("type", "image");
            $.ajax({
                url: $this.baseUrl + "/model/material/upload_media.json",
                type: "post",
                data: formData,
                contentType: false,
                processData: false,
                clearForm: true,
                success(res) {
                    if (res.code == 200) {
                        alert("上传成功");
                        //刷新图片列表
                        $this.showMedia();
                    } else {
                        alert("上传失败");
                    }
                },
                error(data, status, e) {
                    alert("上传出错啦");
                }
            })
        },
        select(e, mediaId) {
            var el = e.target;
            if ($(el)[0].checked) {
                $(el).parent().parent().css("background-color", "rgba(0, 0, 0, 0.08)");
                $(el).css("display", "black");
                this.picObject.selectCount++;
                this.picObject.isShow = true;
                this.picObject.selectList.push(mediaId);
            } else {
                $(el).parent().parent().css("background-color", "");
                this.picObject.selectCount--;
                //如果没有选中的图片不显示批量管理
                if (this.picObject.selectCount <= 0) {
                    this.picObject.isShow = false;
                } else {
                    this.picObject.isShow = true;
                }
                var index = this.picObject.selectList.indexOf(mediaId);
                if (index > -1) {
                    this.splice(index, 1);
                }
            }
        },
        selectAll() {
            $this = this;
            $this.picObject.selectList = [];
            $(".pic-list .pic-item").each(function (index, item) {
                $(item).find("input[type='checkbox']").prop("checked", "checked");
                $(item).css("background-color", "rgba(0, 0, 0, 0.08)");
                $this.picObject.selectCount++;
                var mediaId = $(item).find(".mediaId").text();
                $this.picObject.selectList.push(mediaId);

            })
        },
        UselectAll() {
            $this = this;
            $this.picObject.selectList = [];
            $(".pic-list .pic-item").each(function (index, item) {
                $(item).find("input[type='checkbox']").prop("checked", function () {
                    return false
                });
                $(item).css("background-color", "");
                $this.picObject.isShow = false;
                $this.picObject.selectCount = 0;

            })
        },
        batchDelete() {
            if (confirm("删除会连同微信服务器上到素材也一起删除，你确定批量删除这" + this.picObject.selectList.length + "个素材吗？")) {
                console.log(this.picObject.selectList)
                this.batchdeleteMedia(this.picObject.selectList);
            }
        },
        deleteMedia(mediaId) {
            if (confirm("删除会连同微信服务器上的素材也一起删除，你确定删除吗？")) {
                this.batchdeleteMedia(mediaId);
            }
        },
        deleteNews(mediaId){
            var $this=this;
          //删除图文消息
            if (confirm("删除会连同微信服务器上的图文消息也一起删除，你确定要删除吗？")) {
                $.ajax({
                    url:this.baseUrl+"/model/material/deleteNews.json",
                    data:{mediaId:mediaId},
                    dataType:"json",
                    success:function(res){
                        if(res.code==200){
                            alert("删除成功");
                            $this.showNews();
                        }else{
                            alert(res.message);
                        }
                    },
                    error:function () {
                        alert("系统出错");
                    }

                })
            }
        },
        batchdeleteMedia(medias) {
            var $this = this;
            medias = JSON.stringify(medias);
            medias = medias.replace(/\[|]/g, '');
            medias = medias.replace(/\"/g, "");
            console.log(medias);
            $.ajax({
                url: this.baseUrl + "/model/material/delete_media.json",
                data: {medias: medias},
                dataType: "json",
                success: function (result) {
                    if (result.code == 200) {
                        var temp = "删除数量:" + result.data.count + " 成功删除：" + result.data.successCount + " 删除失败：" + result.data.errorCount;
                        alert(temp);
                        if (result.data.successCount > 0) {
                            $this.showMedia();
                            $this.UselectAll();
                        }
                    } else {
                        alert("删除失败");
                    }

                }, error: function () {
                    alert("删除失败");
                }
            })
        },
        sync(type) {
            var $this = this;
            //同步
            if (confirm("你确定要与微信公众号素材进行同步吗?如果公众号不存在本地的素材，本地素材将会被删除,同步需要一定时间，请耐心等待～")) {
                $.ajax({
                    url: this.baseUrl + "/model/material/sync_media.json",
                    dataType: "json",
                    data: {materialType: type},
                    success: function (res) {
                        if (res.code == 200) {
                            if(type=="news"){
                                $this.showNews();
                            }else{
                                $this.showMedia();
                            }
                            alert("同步成功! 新增或同步修改了：" + res.data.addCount + "个");
                        } else {
                            alert(res.message);
                        }
                    }, error: function () {
                        alert("同步出错。。");
                    }
                })
            }
        },
        page(page) {
            var $this = this;
            if (!(page <= 0) && !(page > this.picObject.totalPage)) {
                if (page > 3 && (page + 2) <= $this.picObject.totalPage) {
                    $this.picObject.beginPage = page - 2;
                    $this.picObject.endPage = page + 2;

                } else if (page <= 3) {
                    $this.picObject.beginPage = 1;
                    $this.picObject.endPage = 5;
                }
                this.picObject.currPage = page;
                this.showMedia();
            }
        },
        pageForNews(page){
            var $this = this;
            if (!(page <= 0) && !(page > this.newsObject.totalPage)) {
                if (page > 3 && (page + 2) <= $this.newsObject.totalPage) {
                    $this.newsObject.beginPage = page - 2;
                    $this.newsObject.endPage = page + 2;

                } else if (page <= 3) {
                    $this.newsObject.beginPage = 1;
                    $this.newsObject.endPage = 5;
                }
                this.newsObject.currPage = page;
                this.showNews();
            }
        }
    }
});
