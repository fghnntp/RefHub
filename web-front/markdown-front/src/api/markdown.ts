import axios from 'axios'

const BASE_URL = 'http://localhost:8000/api/files'

/** 获取所有 Markdown 文件名 */
export async function getFiles(): Promise<string[]> {
  const res = await axios.get<{ files: string[] }>(BASE_URL)
  return res.data.files
}

/** 获取指定 Markdown 文件内容 */
export async function getFile(filename: string): Promise<string> {
  const res = await axios.get<{ content: string }>(`${BASE_URL}/${encodeURIComponent(filename)}`)
  return res.data.content
}

/** 保存（新建或覆盖）Markdown 文件 */
export async function saveFile(filename: string, content: string): Promise<void> {
  await axios.put(`${BASE_URL}/${encodeURIComponent(filename)}`, { content })
}

/** 删除 Markdown 文件 */
export async function deleteFile(filename: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${encodeURIComponent(filename)}`)
}

export async function getPdfUrl(filename: string): Promise<string> {
  console.log('getPdfUrl called with:', filename)
  const res = await axios.get(`${BASE_URL}/${encodeURIComponent(filename)}`, {
    responseType: 'blob'
  })
  return URL.createObjectURL(res.data)
}