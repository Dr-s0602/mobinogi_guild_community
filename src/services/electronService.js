// Electron IPC 통신을 위한 서비스

// Electron의 ipcRenderer를 안전하게 가져오기
const getIpcRenderer = () => {
  try {
    if (window.require) {
      return window.require('electron').ipcRenderer;
    }
    return null;
  } catch (error) {
    console.error('Electron IPC 가져오기 실패:', error);
    return null;
  }
};

// IPC 사용 가능 여부 확인
export const isElectron = () => {
  return window && window.process && window.process.type === 'renderer';
};

// 시트 데이터 읽기
export const readSheet = async (range) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    return await ipcRenderer.invoke('read-sheet', range);
  } catch (error) {
    console.error('시트 데이터 읽기 오류:', error);
    throw error;
  }
};

// 시트 데이터 쓰기
export const writeSheet = async (range, values) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    return await ipcRenderer.invoke('write-sheet', { range, values });
  } catch (error) {
    console.error('시트 데이터 쓰기 오류:', error);
    throw error;
  }
};

// 시트에 데이터 추가
export const appendSheet = async (range, values) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    return await ipcRenderer.invoke('append-sheet', { range, values });
  } catch (error) {
    console.error('시트 데이터 추가 오류:', error);
    throw error;
  }
};

// 로그인 처리
export const login = async (characterName) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    console.log('로그인 요청 전송:', characterName);
    
    if (!characterName) {
      throw new Error('캐릭터 이름이 없습니다');
    }
    
    const result = await ipcRenderer.invoke('login', characterName);
    console.log('로그인 결과 받음:', result);
    return result;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 부캐릭터 추가
export const addSubCharacter = async (mainCharacter, subCharacter) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    return await ipcRenderer.invoke('add-sub-character', { mainCharacter, subCharacter });
  } catch (error) {
    console.error('부캐릭터 추가 오류:', error);
    throw error;
  }
};

// 캐릭터 정보 업데이트
export const updateCharacter = async (characterName, characterInfo) => {
  const ipcRenderer = getIpcRenderer();
  
  if (!ipcRenderer) {
    throw new Error('Electron 환경이 아닙니다. 브라우저에서는 이 기능을 사용할 수 없습니다.');
  }
  
  try {
    return await ipcRenderer.invoke('update-character', { characterName, characterInfo });
  } catch (error) {
    console.error('캐릭터 정보 업데이트 오류:', error);
    throw error;
  }
};

export default {
  isElectron,
  readSheet,
  writeSheet,
  appendSheet,
  login,
  addSubCharacter,
  updateCharacter
};