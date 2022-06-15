$(function() {
    let layer = layui.layer;
    // 获取文章类别列表
    function getArticleList() {
        $.ajax({
            method: "GET",
            url: "/my/article/cates",
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg("获取文章分类别表失败");
                }
                // console.log(res);
                // 调用模板引擎
                let artList = template("articleList", res);
                $("tbody").html(artList);
            },
        });
    }
    getArticleList();
    // 监听添加类别事件
    $(".addArtCate").on("click", function() {
        let index = layer.open({
                type: 1,
                title: ["添加文章分类", "font-size:12px;"],
                area: ["500px", "250px"],
                content: $('#dialog-add').html()
            })
            // 监听弹出框中表单的提交事件  通过代理的方式
            // 因为对话框表单需要先弹出对话框   不能直接给form绑定提交事件 因为那时候form表单还不存在 给父元素绑定
        $('body').on('submit', '#form-add', function(e) {
                e.preventDefault()
                    // 发送ajax请求
                $.ajax({
                    method: 'POST',
                    url: '/my/article/addcates',
                    data: $(this).serialize(),
                    success: function(res) {
                        if (res.status !== 0) {
                            return layer.msg('新增文章分类失败')
                        }
                        console.log(res)
                        layer.msg('新增文章分类成功')
                            // 重置表单为空
                            // $('#form-add')[0].reset()
                            // 重新渲染
                        getArticleList()
                            // 关闭弹出层
                        layer.close(index)
                    }
                })
            })
            // 表单重置  代理的方式实现
        $('body').on('reset', '[type=reset]', function(e) {
            e.preventDefault()
                // 重置表单为空
            $('#form-add')[0].reset()

        })
    })

    // 监听编辑事件  委托代理的方式
    $('tbody').on('click', '#edit', function() {
        console.log($(this).attr('data-Id'))
        let id = $(this).attr('data-Id')
            // 发送ajax请求
        $.ajax({
                method: 'GET',
                url: `/my/article/cates/${id}`,
                success: function(res) {
                    console.log(res)
                    if (res.status !== 0) {
                        return layer.msg('获取文章分类数据失败')
                    }
                    $('[name=name]').val(res.data.name)
                    $('[name=alias]').val(res.data.alias)
                }
            })
            // 弹出对话框
        let index = layer.open({
                type: 1,
                title: ["修改文章分类", "font-size:12px;"],
                area: ["500px", "250px"],
                content: $('#dialog-add').html()
            })
            // 监听编辑表单的提交事件  因为是动态添加的  所有要通过委托代理的方式实现
        $('body').on('submit', '#form-add', function(e) {
                // 必须要阻止表单的默认提交行为
                e.preventDefault()
                    // 发起ajax请求
                $.ajax({
                    method: 'POST',
                    url: '/my/article/updatecate',
                    data: {
                        Id: parseInt(id),
                        name: $('[name=name]').val(),
                        alias: $('[name=alias]').val()
                    },
                    success: function(res) {
                        console.log(res)
                        if (res.status !== 0) {
                            return layer.msg('更新分类信息失败')
                        }
                        // 关闭对话框
                        layer.close(index)
                            // 重新刷新文章类别列表
                        getArticleList()
                    }
                })
            })
            // 监听表单的重置事件
        $('body').on('reset', '[type=reset]', function(e) {
            e.preventDefault()
            $('#form-add')[0].reset()
        })
    })

    // 监听删除事件  委托代理的方式
    $('tbody').on('click', '#del', function() {
        let id = $(this).attr('data-Id')
            // 弹出提示框
        layer.confirm('确定删除?', { icon: 3, title: '提示' }, function(index) {
            // console.log(123)
            // 点击确定所触发的
            // 发起ajax请求
            $.ajax({
                method: 'GET',
                url: `/my/article/deletecate/${id}`,
                success: function(res) {
                    // console.log(res)
                    if (res.status !== 0) {
                        return layer.msg('删除文章分类失败')
                    }
                    layer.msg('删除文章分类成功')
                    layer.close(index)
                        //重新渲染文章分类列表数据
                    getArticleList()
                }
            })
        })
    })
})