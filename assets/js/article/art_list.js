$(function() {
    let layer = layui.layer
    let form = layui.form
    let laypage = layui.laypage
        // 定义一个美化时间的过滤器
    template.defaults.imports.dateFormat = function(date) {
            // return date.split('.')[0]
            const dt = new Date(date)
            let y = dt.getFullYear()
            let m = padZero(dt.getMonth() + 1)
            let d = padZero(dt.getDate())
            let hh = padZero(dt.getHours())
            let mm = padZero(dt.getMinutes())
            let ss = padZero(dt.getSeconds())

            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
        }
        // 定义补零的函数
    function padZero(n) {
        return n % 10 === n ? '0' + n : n
    }
    // 定义一个查询参数对象  需要将参数对象里边的数据提交到服务器
    let data = {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: ''
    }

    // 获取文章列表
    function getArtList() {
        // 发起请求
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data,
            success: function(res) {
                console.log(res)
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败')
                }
                layer.msg('获取文章列表成功')
                    // 代用模板引擎
                let artListHtml = template('artList', res)
                $('tbody').html(artListHtml)
                    // 调用分页的方法
                renderPage(res.total)

            }
        })
    }
    getArtList()


    // 获取文章分类列表
    function getArticleList() {
        $.ajax({
            method: "GET",
            url: "/my/article/cates",
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg("获取文章分类别表失败");
                }
                // console.log(res)
                let cateStr = template('cate', res)
                    // console.log(cateStr)
                $('[name=cate_id]').html(cateStr)
                    // 通知 layui重新渲染表单区域的ui结构  没有这一行代码则select的下拉菜单不显示
                form.render()

            }
        })
    }
    getArticleList()
        // 实现筛选功能
    $('.layui-form').on('submit', function(e) {
        e.preventDefault()
        data.cate_id = $('[name=cate_id]').val()
        data.state = $('[name=state]').val()
            // 重新刷新文章列表
        getArtList()
    })

    // 实现分页功能
    // 定义渲染分页的方法
    function renderPage(total) {
        //执行一个laypage实例
        laypage.render({
            elem: 'pageBox', //注意，这里的 pageBox 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: data.pagesize, //每页显示几条数据
            limits: [2, 3, 5, 10],
            curr: data.pagenum, //设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            // 分页发生切换的时候  触发jump回调
            // 触发jump回调的方式有两种:
            // 1.点击页码的时候,会触发jump回调
            // 2.只要调用了laypage.render()方法,就会触发jump回调
            jump: function(obj, first) {
                //obj包含了当前分页的所有参数，比如：
                // console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                // console.log(obj.limit); //得到每页显示的条数
                data.pagenum = obj.curr
                data.pagesize = obj.limit
                    // getArtList()   这里不可以直接调用刷新列表的方法 会出现死循环 (只要调用了laypage.render()方法,就会触发jump回调)
                    //首次不执行
                    // 可以通过first的值，来判断是哪种方式触发的jump回调
                    // console.log(first)
                    // 点击页码时 first值为undefined    
                if (!first) {
                    // first值为false(点击页码时 first值为undefined  )  !first值为true   
                    getArtList()
                }
            }
        })

    }

    // 通过代理的形式 为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btndel', function() {
        // 获得删除按钮的个数
        // console.log($('.btndel'))
        let delLen = $('.btndel').length
        console.log(delLen)
            // 获取当前删除数据的id值  
        let id = $(this).attr('data-Id')
            // 弹出提示框
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function(index) {
            // 发送请求
            $.ajax({
                method: 'GET',
                url: `/my/article/delete/${id}`,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败')
                    }
                    layer.msg('删除成功')

                    // 如果当前页（比如是第4页）最后一条数据也删除了 此时的页码仍是当前页（第4页）
                    // 当数据删除完成后  需要判断当前这一页中 是否还有剩余的数据 
                    // 如果没有剩余的数据 则让页码值-1 重新再调用getArtList()方法
                    if (delLen === 1) {
                        // 如果delLen的值为1  证明删除完毕之后 页面上没有任何数据了
                        // 页码值最小必须是1
                        if (data.pagenum === 1) {
                            data.pagenum = 1
                        } else {
                            data.pagenum = data.pagenum - 1
                        }
                    }
                    getArtList()
                }

            })
            layer.close(index)
        })
    })
})