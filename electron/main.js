const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const apiService = require('../src/services/apiService');
const { google } = require('googleapis');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1680, // 1200 * 1.4 = 1680
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // 개발 모드에서는 로컬 서버 사용, 프로덕션에서는 빌드된 파일 사용
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(startUrl);

  // 개발자 도구 열기 (개발 중에만)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // 커스텀 메뉴 생성
  createCustomMenu();
}

// 커스텀 메뉴 생성 함수
function createCustomMenu() {
  const template = [
    {
      label: '메뉴',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: '개발자: 세이크리드',
              buttons: ['확인']
            });
          }
        },
        {
          label: 'Special Thanks',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Special Thanks',
              message: '대주주: 오리거북이',
              buttons: ['확인']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Google Sheets API 초기화
const initSheetsAPI = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'auto-453506-e58edc2051ef.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (error) {
    console.error('Google Sheets API 초기화 오류:', error);
    throw error;
  }
};

// 시트 존재 확인 및 생성
async function checkAndCreateSheet(sheets, characterName) {
  try {
    // 스프레드시트 정보 가져오기
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
    });
    
    // 시트 목록 확인
    const sheetList = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    
    // 캐릭터 이름과 동일한 시트가 있는지 확인
    if (!sheetList.includes(characterName)) {
      // 시트 생성
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: characterName,
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10
                }
              }
            }
          }]
        }
      });
      
      // 기본 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: `${characterName}!A1:C1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['name', 'job', 'status']]
        }
      });
      
      // 부캐릭터 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: `${characterName}!E1:G1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['subName', 'subJob', 'subStatus']]
        }
      });
      
      return { exists: false, created: true };
    }
    
    return { exists: true, created: false };
  } catch (error) {
    console.error('시트 확인/생성 오류:', error);
    throw error;
  }
}

// 캐릭터 정보 가져오기
async function getCharacterInfo(sheets, characterName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range: `${characterName}!A2:C2`,
    });
    
    const values = response.data.values;
    if (values && values.length > 0) {
      return {
        name: values[0][0] || characterName,
        job: values[0][1] || '',
        status: values[0][2] || ''
      };
    } else {
      // 데이터가 없으면 기본값 설정
      await sheets.spreadsheets.values.update({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: `${characterName}!A2:C2`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[characterName, '전사', '']]
        }
      });
      
      return {
        name: characterName,
        job: '전사',
        status: ''
      };
    }
  } catch (error) {
    console.error('캐릭터 정보 가져오기 오류:', error);
    throw error;
  }
}

// IPC 핸들러: 시트 데이터 읽기
ipcMain.handle('read-sheet', async (event, range) => {
  try {
    console.log(`시트 읽기 요청: ${range}`);
    const sheets = await initSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range: range || 'ID!A1:B5',
    });
    
    console.log('시트 데이터 읽기 성공:', response.data.values);
    return response.data.values || [];
  } catch (error) {
    console.error('시트 데이터 읽기 오류:', error);
    throw error;
  }
});

// IPC 핸들러: 시트 데이터 쓰기
ipcMain.handle('write-sheet', async (event, { range, values }) => {
  try {
    console.log(`시트 쓰기 요청: ${range}`);
    const sheets = await initSheetsAPI();
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
    
    console.log('시트 데이터 쓰기 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('시트 데이터 쓰기 오류:', error);
    throw error;
  }
});

// IPC 핸들러: 시트에 데이터 추가
ipcMain.handle('append-sheet', async (event, { range, values }) => {
  try {
    console.log(`시트 추가 요청: ${range}`);
    const sheets = await initSheetsAPI();
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values },
    });
    
    console.log('시트 데이터 추가 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('시트 데이터 추가 오류:', error);
    throw error;
  }
});

// IPC 핸들러: 로그인 처리
ipcMain.handle('login', async (event, characterName) => {
  try {
    console.log(`로그인 요청:`, characterName);
    
    // 캐릭터 이름 유효성 검사
    if (!characterName) {
      console.error('캐릭터 이름이 없습니다');
      return {
        success: false,
        error: '캐릭터 이름을 입력해주세요.'
      };
    }
    
    // 시트에서 캐릭터 확인
    try {
      const sheets = await initSheetsAPI();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: 'ID!A2:B100',
      });
      
      const idData = response.data.values || [];
      console.log('캐릭터 데이터:', idData);
      
      // 로그인 시도한 캐릭터 이름 찾기
      const characterFound = idData.some(row => row[0] === characterName);
      
      if (characterFound) {
        // 로그 기록
        const now = new Date().toISOString();
        await sheets.spreadsheets.values.append({
          spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
          range: 'Log!A:C',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: { values: [[now, characterName, '로그인']] },
        });
        
        // 캐릭터 시트 확인 및 생성
        const sheetResult = await checkAndCreateSheet(sheets, characterName);
        console.log('시트 확인 결과:', sheetResult);
        
        // 캐릭터 정보 가져오기
        const characterInfo = await getCharacterInfo(sheets, characterName);
        console.log('캐릭터 정보:', characterInfo);
        
        // 부캐릭터 정보 가져오기
        const subCharactersResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
          range: `${characterName}!E2:G50`,
        });
        
        const subCharacters = [];
        const subCharData = subCharactersResponse.data.values || [];
        
        for (const row of subCharData) {
          if (row[0]) { // 이름이 있는 경우만 추가
            subCharacters.push({
              name: row[0],
              job: row[1] || '',
              status: row[2] || ''
            });
          }
        }
        
        return {
          success: true,
          character: characterInfo,
          subCharacters: subCharacters
        };
      } else {
        return {
          success: false,
          error: '길드에 가입되지 않은 캐릭터입니다.'
        };
      }
    } catch (sheetError) {
      console.error('시트 연결 오류:', sheetError);
      throw new Error('시트 연결 오류: ' + sheetError.message);
    }
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// IPC 핸들러: 부캐릭터 추가/업데이트/삭제
ipcMain.handle('add-sub-character', async (event, { mainCharacter, subCharacter }) => {
  try {
    console.log(`부캐릭터 추가/업데이트 요청:`, mainCharacter, subCharacter);
    
    if (!mainCharacter || !subCharacter || !subCharacter.name) {
      return {
        success: false,
        error: '캐릭터 정보가 부족합니다.'
      };
    }
    
    const sheets = await initSheetsAPI();
    
    // 삭제 요청 처리 (이름이 __DELETED__로 시작하는 경우)
    if (subCharacter.name.startsWith('__DELETED__')) {
      // 원래 이름 추출
      const nameParts = subCharacter.name.split('__');
      if (nameParts.length >= 3) {
        const originalName = nameParts[2];
        console.log(`부캐릭터 삭제 요청: ${originalName} (시트: ${mainCharacter})`);
        
        try {
          // 부캐릭터 목록 가져오기
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
            range: `${mainCharacter}!E2:G50`,
          });
          
          const values = response.data.values || [];
          console.log('부캐릭터 목록:', values);
          
          // 삭제할 부캐릭터 찾기
          let rowToDelete = -1;
          for (let i = 0; i < values.length; i++) {
            if (values[i] && values[i][0] === originalName) {
              rowToDelete = i + 2; // 헤더(1) + 인덱스(i)
              console.log(`삭제할 행 번호: ${rowToDelete}`);
              break;
            }
          }
          
          if (rowToDelete > 0) {
            // 해당 행 비우기
            await sheets.spreadsheets.values.clear({
              spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
              range: `${mainCharacter}!E${rowToDelete}:G${rowToDelete}`,
            });
            
            console.log(`부캐릭터 ${originalName} 삭제 완료`);
            
            return {
              success: true,
              deleted: true,
              originalName: originalName
            };
          } else {
            console.log(`삭제할 부캐릭터를 찾을 수 없음: ${originalName}`);
          }
        } catch (error) {
          console.error('부캐릭터 삭제 중 오류:', error);
        }
      }
      
      return {
        success: false,
        error: '삭제할 부캐릭터를 찾을 수 없습니다.'
      };
    }
    
    // 부캐릭터 목록 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range: `${mainCharacter}!E2:G50`,
    });
    
    const values = response.data.values || [];
    
    // 이미 존재하는 부캐릭터인지 확인
    let existingRow = -1;
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === subCharacter.name) {
        existingRow = i + 2; // 헤더(1) + 인덱스(i)
        break;
      }
    }
    
    if (existingRow > 0) {
      // 기존 부캐릭터 업데이트
      await sheets.spreadsheets.values.update({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: `${mainCharacter}!E${existingRow}:G${existingRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            subCharacter.name,
            subCharacter.job || '전사',
            subCharacter.status || ''
          ]]
        }
      });
    } else {
      // 새 부캐릭터 추가
      const nextRow = values.length + 2; // 헤더(1) + 기존 데이터 수
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
        range: `${mainCharacter}!E${nextRow}:G${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            subCharacter.name,
            subCharacter.job || '전사',
            subCharacter.status || ''
          ]]
        }
      });
    }
    
    return {
      success: true,
      subCharacter: {
        name: subCharacter.name,
        job: subCharacter.job || '전사',
        status: subCharacter.status || ''
      }
    };
  } catch (error) {
    console.error('부캐릭터 추가/업데이트 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// IPC 핸들러: 캐릭터 정보 업데이트
ipcMain.handle('update-character', async (event, { characterName, characterInfo }) => {
  try {
    console.log(`캐릭터 정보 업데이트 요청:`, characterName, characterInfo);
    
    if (!characterName || !characterInfo) {
      return {
        success: false,
        error: '캐릭터 정보가 부족합니다.'
      };
    }
    
    const sheets = await initSheetsAPI();
    
    // 캐릭터 정보 업데이트
    await sheets.spreadsheets.values.update({
      spreadsheetId: '19zCU_XZjcWgKlaJQQx2KJs_y7LruXjpFfe1vZQUrKlQ',
      range: `${characterName}!A2:C2`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          characterInfo.name || characterName,
          characterInfo.job || '전사',
          characterInfo.status || ''
        ]]
      }
    });
    
    return {
      success: true,
      character: {
        name: characterInfo.name || characterName,
        job: characterInfo.job || '전사',
        status: characterInfo.status || ''
      }
    };
  } catch (error) {
    console.error('캐릭터 정보 업데이트 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
});