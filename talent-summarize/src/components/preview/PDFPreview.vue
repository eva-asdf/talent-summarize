<template>
  <div class="pdf-preview">
    <vue-pdf-embed
      :source="state.source"
      :style="styleFn"
      class="vue-pdf-embed"
      :page="state.pageNum"
    />
    <div class="page-tool">
      <div class="page-tool-item" @click="lastPage">上一页</div>
      <div class="page-tool-item" @click="nextPage">下一页</div>
      <div class="page-tool-item">{{ state.pageNum }}/{{ state.numPages }}</div>
      <div class="page-tool-item" @click="pageZoomOut">放大</div>
      <div class="page-tool-item" @click="pageZoomIn">缩小</div>
      <div class="page-tool-item" @click="up">向上</div>
      <div class="page-tool-item" @click="down">向下</div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, computed } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import { createLoadingTask } from "vue3-pdfjs/esm"; // 获得总页数
PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'
const state = reactive({
  source: "http://localhost:8000/3.pdf", //预览pdf文件地址
  pageNum: 1, //当前页面
  scale: 1, // 缩放比例
  numPages: 0, // 总页数
  position: 0,
});

onMounted(() => {
  const loadingTask = createLoadingTask(state.source);
  loadingTask.promise.then((pdf) => {
    state.numPages = pdf.numPages;
  });
});

const styleFn = computed(
  () => `transform:scale(${state.scale}) translateY(${state.position * 100}%);`
);
function lastPage() {
  if (state.pageNum > 1) {
    state.pageNum -= 1;
  }
}
function nextPage() {
  if (state.pageNum < state.numPages) {
    state.pageNum += 1;
  }
}
function pageZoomOut() {
  if (state.scale < 2) {
    state.scale += 0.1;
  }
}
function pageZoomIn() {
  if (state.scale > 1) {
    state.scale -= 0.1;
  }
}
function up() {
  if (state.position < 0 || state.scale - 1 > Math.abs(state.position) * 2) {
    state.position += 0.1;
  }
}
function down() {
  if (state.position > 0 || state.scale - 1 > Math.abs(state.position) * 2) {
    state.position -= 0.1;
  }
}
</script>
<style lang="css" scoped>
.pdf-preview {
  position: relative;
  height: 100vh;
  padding: 20px 0;
  box-sizing: border-box;
  background: rgb(66, 66, 66);
  display: flex;
  flex-direction: column;
  justify-items: center;
  justify-content: space-around;
  overflow: hidden;
}

.vue-pdf-embed {
  text-align: center;
  width: 515px;
  border: 1px solid #e5e5e5;
  margin: 0px auto;
  box-sizing: border-box;
  overflow: hidden;
}

.pdf-preview {
  position: relative;
  height: 100vh;
  padding: 20px 0;
  box-sizing: border-box;
  background-color: #e9e9e9;
}

.vue-pdf-embed {
  text-align: center;
  width: 515px;
  border: 1px solid #e5e5e5;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-tool {
  padding-left: 15px;
  padding-right: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgb(66, 66, 66);
  color: white;
  border-radius: 19px;
  z-index: 100;
  cursor: pointer;
  margin-left: 50%;
  transform: translateX(-50%);
}
.page-tool-item {
  padding: 8px 15px;
  padding-left: 10px;
  cursor: pointer;
}
</style>
