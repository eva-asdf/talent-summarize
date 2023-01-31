<template>
  <div>
    <!-- <Preview></Preview> -->
    <uploadFile></uploadFile>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Preview from "./components/preview/DOCPreview.vue";
import uploadFile from "./components/uploadFile/uploadFile.vue";

const filename = ref("");

</script>

<style scoped>

</style>
