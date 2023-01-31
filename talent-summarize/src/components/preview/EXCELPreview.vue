<template>
  <div>
    <div>
      <div
        id="luckysheet"
        style="
          margin: 0px;
          padding: 0px;
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0px;
          top: 0px;
        "
      ></div>
    </div>
  </div>
</template>

<script setup>
import LuckyExcel from "luckyexcel";
import axios from "axios";

function init(file) {
  luckysheet.destroy();
  try {
    LuckyExcel.transformExcelToLucky(file, (exportJson) => {
      if (exportJson.sheets === null || !exportJson.sheets.length) {
        console.error("无法读取excel文件的内容,当前不支持xls文件!");
        return;
      }
      luckysheet.create({
        container: "luckysheet",
        showinfobar: false,
        lang: "zh",
        data: exportJson.sheets,
        title: exportJson.info.name,
        userInfo: exportJson.info.name.creator,
      });
    });
  } catch (error) {
    console.log("无法读取excel文件的内容,当前不支持xls文件!");
  }
}

axios({
  url: "http://localhost:8000/1.xlsx",
  method: "get",
  responseType: "blob",
})
  .then(({ data }) => {
    console.log(data);
    const blob = new Blob([data]);
    const file = new File([blob], "1.xlsx");
    init(file); // 开始渲染
  })
  .catch((e) => {
    console.log(e);
  });
</script>

<!-- <script>
import axios from "axios";
import { asynLoad } from "@/utils/excel";
import LuckyExcel from "luckyexcel";
import { ref } from "vue";
export default {
  data() {
    return {
      fileName: "hello",
    };
  },
  created() {
    this.loadPlugins();
  },
  methods: {
    // 获取传递的url参数
    getComment() {
      var afterUrl = window.location.search;
      let str = afterUrl.split("?")[1].split("&");
      for (let i = 0; i < str.length; i++) {
        let a = str[i].split("=");
        this.obj[a[0]] = a[1];
      }
    },
    loadPlugins() {
      const baseURL = "//cdn.jsdelivr.net/npm/luckysheet@latest/dist";
      Promise.all([
        asynLoad(`${baseURL}/plugins/css/pluginsCss.css`, true),
        asynLoad(`${baseURL}/plugins/plugins.css`, true),
        asynLoad(`${baseURL}/css/luckysheet.css`, true),
        asynLoad(`${baseURL}/assets/iconfont/iconfont.css`, true),
        asynLoad(`${baseURL}/plugins/js/plugin.js`),
        asynLoad(`${baseURL}/luckysheet.umd.js`),
      ])
        .then(() => {
          luckysheet = window.luckysheet;
          this.getOriginFile(); // 获取远端文件
        })
        .catch((res) => {});
    },
    getOriginFile() {
      axios({
        method: "post",
        responseType: "blob",
        //请求头，要自己写
        headers: {},
        //excel文件路径
        url: "",
      })
        .then(({ data }) => {
          const blob = new Blob([data]);
          const file = new File([blob], this.fileName);
          this.init(file); // 开始渲染
        })
        .catch((e) => {})
        .finally(() => {});
    },
    // 渲染方法，接受文件对象，如果是本地文件直接传入文件即可
    init(file) {
      luckysheet.destroy(); // 先销毁当前容器
      LuckyExcel.transformExcelToLucky(file, (exportJson) => {
        if (exportJson.sheets === null || !exportJson.sheets.length) {
          this.$message.error("无法读取excel文件的内容,当前不支持xls文件!");
          return;
        }
        luckysheet.create({
          container: "luckysheet",
          showinfobar: false,
          lang: "zh",
          data: exportJson.sheets,
          title: exportJson.info.name,
          userInfo: exportJson.info.name.creator,
        });
      });
    },
  },
};
</script> -->

<style scoped></style>
