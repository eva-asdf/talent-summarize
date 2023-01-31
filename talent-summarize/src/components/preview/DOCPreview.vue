<template>
  <div ref="container"></div>
</template>
<script setup>
import { ref } from "vue";
import { renderAsync } from "docx-preview";
import axios from "axios";

let container = ref(null);
function filechange() {
  axios({
    url:'http://localhost:8000/4.ppt',
    method:'get',
    responseType:'blob'
  })
    .then((res) => {
      renderAsync(res.data, container.value, null, {
        className: "docx", // 默认和文档样式类的类名/前缀
        inWrapper: true, // 启用围绕文档内容渲染包装器
        ignoreWidth: false, // 禁止页面渲染宽度
        ignoreHeight: false, // 禁止页面渲染高度
        ignoreFonts: false, // 禁止字体渲染
        breakPages: true, // 在分页符上启用分页
        ignoreLastRenderedPageBreak: true, //禁用lastRenderedPageBreak元素的分页
        experimental: false, 
        trimXmlDeclaration: true, 
        debug: false, 
      });
    })
    .catch((err) => {});
}
filechange();
</script>
