import axios from "./axios";
//  分片下载逻辑与分片上传逻辑相似，只是分片是利用http请求头的range进行分片，请求后的再作合并
//  先请求获得文件的大小，在根据大小划分chunks
const DEFAULF_CHUNK_SIZE = 1 * 1024 * 1024
const MAX_CHUNK_SIZE = 9

function downloadRange(url, start, end, i) {
  axios.get(url, {
    headers: {
      'range': `bytes=${start}-${end}`
    },
    responseType: 'blob',
  }).then(res => {
    return {
      i,
      data: res.data
    }
  })
}

// 合并buffer
function concatenate(arrays) {
  let totalLength = 0;
  for (let arr of arrays) {
    totalLength += arr.length;
  }
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export const download = (url, type = "text/plain;charset=utf-8") => {
  axios({
    url,
    method: 'head',
  }).then(async (res) => { // 获取文件长度/大小
    const size = Number(res.headers['content-length']);
    let chunkSize, length
    if (size > MAX_CHUNK_SIZE * DEFAULF_CHUNK_SIZE) {
      chunkSize = Math.ceil(size / MAX_CHUNK_SIZE)
      length = MAX_CHUNK_SIZE
    } else {
      chunkSize = DEFAULF_CHUNK_SIZE
      length = Math.ceil(size / chunkSize)
    }
    const arr = []
    for (let i = 0; i < length; i++) {
      let start = i * chunkSize;
      let end = (i == length - 1) ? size - 1 : (i + 1) * m - 1;
      arr.push(downloadRange(url, start, end, i))
    }
    const res_1 = await Promise.all(arr);
    const arrBufferList = res_1.sort(item => item.i - item.i).map(item_1 => new Uint8Array(item_1.data));
    const allBuffer = concatenate(arrBufferList);
    const blob = new Blob([allBuffer], { type });
    const blobUrl = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.download = '360_0388.jpg';
    aTag.href = blobUrl;
    aTag.click();
    URL.revokeObjectURL(blob);
    return blob;
  })
}