$(function() {
    let layer = layui.layer
    let form = layui.form
    initCate()
        // 定义加载文章分类的方法
    function initCate() {
        // 获取文章分类列表
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类列表失败')
                }
                // 调用模板引擎
                let htmlStr = template('artCate', res)
                $('[name=cate_id]').html(htmlStr)
                form.render()
            }
        })
    }

    // 初始化富文本编辑器  引入富文本编辑器的2个脚本 window上会挂载一个initEditor()方法
    initEditor()

    // 1.初始化图片裁剪器
    let $image = $('#image')
        // 2.裁剪选项
    let options = {
            aspectRatio: 400 / 280,
            preview: '.img-preview'
        }
        // 3.初始化裁剪区域
    $image.cropper(options)

    // 选择封面
    $('.btnChoose').on('click', function() {
        $('#coverFile').click()
    })
    $('#coverFile').change(function(e) {
        // console.log(e)
        if (e.target.files.length < 1) {
            //用户没有选择文件
            return layer.msg('请选择图片')
        }
        // 拿到用户选择的文件
        let file = e.target.files[0]
            // 根据选择的文件 创建一个对应的url地址
        let imgNewUrl = URL.createObjectURL(file)
            // 先销毁旧的裁剪区域 再重新设置图片路径 之后再创建新的裁剪区域
        $image.cropper('destroy').attr('src', imgNewUrl).cropper(options)
    })

    // 定义文章的发布状态
    let state = '已发布'
        // 为存为草稿按钮绑定点击事件处理函数
    $('#btnSave2').on('click', function() {
            state = '草稿'
        })
        // 为表单绑定submit提交事件
    $('#formPub').on('submit', function(e) {
        e.preventDefault()
        console.log(this)
        console.log($(this)[0])
            // 基于form表单 快速创建一个FormData对象
        let fd = new FormData($(this)[0])
            // 将文章的发布状态存到fd中
        fd.append('state', state)
            // fd.forEach(function(item, index) {
            //     console.log(item, index)
            // })
            // 将封面裁剪过后的图片 输出为一个文件对象
        $image.cropper('getCroppedCanvas', {
            // 创建一个canvas画布
            width: 400,
            height: 280
        }).toBlob(function(blob) {
            // 将画布上的内容转为文件对象 blob
            // 将文件对象blob存储到fd中
            fd.append('cover_img', blob)
                // 发起请求
            $.ajax({
                method: 'POST',
                url: '/my/article/add',
                data: fd,
                // 如果向服务器提交的是FormData格式的数据  必须添加以下2个配置项
                contentType: false,
                processData: false,
                success: function(res) {
                    console.log(res)
                    if (res.status !== 0) {
                        return layer.msg('发布文章失败')
                    }
                    layer.msg('发布文章成功')
                        // 跳转到文章列表页面
                    location.href = '/article/art_list.html'
                }
            })
        })
    })

})