<template>
  <div>
    <input type="file" name="" ref="fileInupt" :disabled="isUploading">
    <button @click="uploadFile">确定</button>
    <button @click="pauseReq">暂停</button>
    <button @click="restart">restart</button>
    <div>{{ isUploading? '上传中': '。。。' }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Limit } from "../../utils/requestConcurrent"
import axiosInstance from '../../utils/axios';
// import axiosInstance from 'axios';
const fileInupt = ref(null)
const isUploading = ref(false)
const DEFAULF_CHUNK_SIZE = 1 * 1024 * 1024
const TRY_COUNT = 3

const limit = new Limit(3)

let hash
let allPromiseFinish

const uploadFile = async () => {
  initData()
  if (fileInupt.value?.files.length) {
    isUploading.value = true
    const file = fileInupt.value.files[0]
    const chunkSize = file.size > 8 * DEFAULF_CHUNK_SIZE ? Math.ceil(file.size / 8) : DEFAULF_CHUNK_SIZE
    const chunks = splitFile(fileInupt.value.files[0], chunkSize);
    ({ hash } = await getHash(chunks))
    const list = []
    for (const chunk of chunks) {
      const formData = new FormData()
      formData.append('fileHash', hash)
      formData.append('chunk', chunk.file)
      formData.append('chunkhash', hash + '-' + chunk.index)
      list.push([formData, chunk.index])
    }
    allPromiseFinish = Promise.all(list.map(([formData, index]) => limit.build(() => requestFn(formData, index))))
    allPromiseFinish.then(res => {
      alert('上传成功')
      isUploading.value = false
      axiosInstance.get('http://localhost:8000/confirmUploadFinish', { hash })
    })
  } else {
    console.log('无文件');
  }
}

let unfinishedAbortList = []
let isFail = false
let isAbort = false
const requestFn = (formData, index) => {
  const controller = new AbortController();
  if (!unfinishedAbortList[index]) {
    unfinishedAbortList[index] = {
      controller,
      index,
      formData,
      already: false,
      restartCount: 0,
      promiseStatus: 'pedding',
      promise: undefined
    }
  } else {
    unfinishedAbortList.controller = controller
    unfinishedAbortList.promiseStatus = 'pedding'
  }
  const result = axiosInstance.post(
    'http://localhost:8000/uploadfile',
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: progressEvent => {
        let persent = (progressEvent.loaded / progressEvent.total * 100 | 0)		//上传进度百分比
        console.log(persent)
      },
      signal: controller.signal
    }
  )
    .then(res => {
      unfinishedAbortList[index].already = true
      unfinishedAbortList[index].promiseStatus = 'fullfill'
      return res
    }).catch(err => {
      unfinishedAbortList[index].promiseStatus = 'reject'
      if (!isFail && !isAbort) {
        if (unfinishedAbortList[index].restartCount++ < TRY_COUNT) {
          console.log(index, unfinishedAbortList[index].restartCount);
          allPromiseFinish = Promise.all([...(FilternNotReject()), limit.build(() => requestFn(formData, index))])
          allPromiseFinish.then(() => {
            console.log('上传成功');
            alert('上传成功')
            isUploading.value = false
            axiosInstance.get('http://localhost:8000/confirmUploadFinish', { hash, cancel: false })
          }, (err) => {
            // console.log(err);
          })
        } else {
          isFail = true
          allPromiseFinish.catch(() => {
            isUploading.value = false
            console.log('上传失败');
            alert('上传失败')
            axiosInstance.get('http://localhost:8000/confirmUploadFinish', { hash, cancel: true })
          })
        }
      }
      return Promise.reject(err)
    })
  unfinishedAbortList[index].promise = result
  return result
}

const FilternNotReject = () => {
  const ans = []
  unfinishedAbortList.forEach((val) => {
    if (val.promiseStatus !== 'reject') ans.push(val.promise)
  })
  return ans
}

const splitFile = (file, size = DEFAULF_CHUNK_SIZE) => {
  const chunks = []
  let cur = 0, count = 0
  while (cur < file.size) {
    chunks.push({ index: count, file: file.slice(cur, cur + size) })
    cur += size
    count++
  }
  return chunks
}

const getHash = (chunks) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/uploadfile.worker.js')
    worker.onmessage = ({ data }) => {
      if (data !== undefined) resolve(data)
      else reject('error')
      worker.terminate()
    }
    worker.postMessage({ chunks })
  })
}

const pauseReq = () => {
  isAbort = true
  isUploading.value = false
  unfinishedAbortList.forEach((val) => {
    if (!val.already) {
      val.controller.abort()
    }
  })
}

const restart = () => {
  isAbort = false
  isUploading.value = true
  limit.queue.length = 0
  unfinishedAbortList = unfinishedAbortList.filter((val) => !val.already)
  allPromiseFinish = Promise.all(unfinishedAbortList.map(({ formData, index }) => limit.build(() => requestFn(formData, index))))
  allPromiseFinish.then(res => {
    alert('上传成功')
    isAbort || axiosInstance.get('http://localhost:8000/confirmUploadFinish', { hash })
  })
}

const initData = () => {
  hash = null
  isAbort = false
  isFail = false
  unfinishedAbortList.length = 0
}
</script>

<style scoped>

</style>