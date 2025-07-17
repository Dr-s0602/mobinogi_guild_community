const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 설정 파일 로드
const loadConfig = () => {
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('설정 파일 로드 오류:', error);
    return {
      apiUrl: '',
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ'
    };
  }
};

const config = loadConfig();

// 로그인 요청
const login = async (characterName) => {
  try {
    const response = await axios.get(`${config.apiUrl}`, {
      params: {
        action: 'login',
        characterName
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('로그인 요청 오류:', error);
    throw error;
  }
};

// 캐릭터 존재 여부 확인
const checkCharacter = async (characterName) => {
  try {
    const response = await axios.get(`${config.apiUrl}`, {
      params: {
        action: 'checkCharacter',
        name: characterName
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('캐릭터 확인 오류:', error);
    throw error;
  }
};

// 활동 로그 기록
const logActivity = async (characterName, activity) => {
  try {
    const response = await axios.post(`${config.apiUrl}`, {
      action: 'logActivity',
      characterName,
      activity
    });
    
    return response.data;
  } catch (error) {
    console.error('활동 로그 기록 오류:', error);
    throw error;
  }
};

module.exports = {
  login,
  checkCharacter,
  logActivity
};