document.addEventListener('DOMContentLoaded', function () {

    // 対象のリンク要素を取得します
    const httpMessageLink = document.querySelector('a.firstMess[href="https://stellar-ririn.github.io/"]');
    if (httpMessageLink) {
        // 現在のプロトコルがHTTPSの場合
        if (window.location.protocol === "https:") {
            httpMessageLink.style.display = 'none'; // リンクを非表示にする
        }
    }

    // Materializeのコンポーネントを初期化 (Textareaなど)
    M.AutoInit();

    const addPairBtn = document.getElementById('add-pair-btn');
    const pairContainer = document.getElementById('pair-container');
    let pairCounter = 1; // 追加されるペアのID用カウンター
    const addDynamicDictBtn = document.getElementById('add-dynamic-dict-btn');
    const dynamicDictContainer = document.getElementById('dynamic-dict-container');

    // HTML属性値として使うためにエスケープするヘルパー
    function escapeAttributeValue(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ペア入力欄をDOMに追加する関数
    function createAndAppendPairElement(id, beforeVal = '', afterVal = '') {
        const labelIndex = id + 1;
        const newPairHtml = `
      <div class="row pair-item">
        <div class="col s12 m5">
          <div class="input-field">
            <input id="pair-input-1-${id}" type="text" class="validate" value="${escapeAttributeValue(beforeVal)}">
            <label for="pair-input-1-${id}" class="${beforeVal ? 'active' : ''}">${labelIndex}つ目の修正元</label>
          </div>
        </div>
        <div class="col s12 m2 pair-arrow">
          <i class="material-icons hide-on-med-and-up">arrow_downward</i>
          <span class="hide-on-small-only">></span>
          <label style="display: flex; align-items: center; justify-content: center; margin-top: 5px; padding-left: 15px;">
            <input type="checkbox" class="filled-in" id="pair-keyword-check-${id}" />
            <span style="font-size: 0.9rem;">[キーワード]</span>
          </label>
        </div>
        <div class="col s12 m5">
          <div class="input-field">
            <input id="pair-input-2-${id}" type="text" class="validate" value="${escapeAttributeValue(afterVal)}">
            <label for="pair-input-2-${id}" class="${afterVal ? 'active' : ''}">${labelIndex}つ目の修正後</label>
          </div>
        </div>
      </div>
    `;
        pairContainer.insertAdjacentHTML('beforeend', newPairHtml);
    }

    addPairBtn.addEventListener('click', function () {
        createAndAppendPairElement(pairCounter++);
        M.updateTextFields(); // 新しい要素が追加された後にラベルを更新
    });

    // --- 動的辞書グループの初期入力欄生成 & 追加ボタン ---
    let dynamicDictCounter = 0; // ID用のカウンター (0から開始)

    // 初期表示時に最初のペアのラベルがアクティブになるようにする
    M.updateTextFields();

    function addDynamicDictInput(index) {
        const newDynamicInputHtml = `
        <div class="col s6 m4 l3 input-field dynamic-dict-item"> <!-- レスポンシブクラスに変更 -->
          <input id="dynamic-dict-input-${index}" type="text" class="validate">
          <label for="dynamic-dict-input-${index}">単語 ${index + 1}</label>
        </div>
    `;
        dynamicDictContainer.insertAdjacentHTML('beforeend', newDynamicInputHtml);
        M.updateTextFields();
    }

    // 初期状態で4つ追加
    for (let i = 0; i < 4; i++) {
        addDynamicDictInput(dynamicDictCounter++);
    }

    // 追加ボタンのイベントリスナー
    addDynamicDictBtn.addEventListener('click', function () {
        addDynamicDictInput(dynamicDictCounter++);
    });

    // --- ここから下に、各要素を操作するJavaScriptコードを追加できます ---

    // 例: すべての入力ペアの値を取得する
    function getAllPairs() {
        const pairs = [];
        const pairItems = pairContainer.querySelectorAll('.pair-item');
        pairItems.forEach(item => {
            const input1 = item.querySelector(`input[id^="pair-input-1-"]`);
            const input2 = item.querySelector(`input[id^="pair-input-2-"]`);
            if (input1 && input2) {
                const id = input1.id.split('-').pop();
                const checkbox = document.getElementById(`pair-keyword-check-${id}`);
                pairs.push({
                    input1: input1.value,
                    input2: input2.value,
                    isKeyword: checkbox ? checkbox.checked : false
                });
            }
        });
        return pairs;
    }

    // --- 変換機能の追加 ---
    let dictionary = {}; // 辞書データを格納する変数 (非同期で読み込むため let で宣言) - これはOK
    let baseDictionary = {}; // dictionary.csv から読み込んだ元の辞書を保持する変数

    function parseDictionary(csvString) {
        const parsedDict = {};
        const lines = csvString.trim().split('\n');
        lines.forEach(line => {
            const words = line.split(',').map(word => word.trim()).filter(word => word !== '');
            if (words.length >= 2) {
                for (let i = 1; i < words.length; i++) {
                    const minimalForm = words[i];
                    if (!parsedDict[minimalForm]) {
                        parsedDict[minimalForm] = words;
                    }
                }
            }
        });
        return parsedDict;
    }

    // --- 辞書ファイルの読み込みと変換ボタンのイベントリスナー設定 ---
    async function initializeApp() {
        try {
            // --- 辞書ファイル(dictionary.csv)を読み込む ---
            const dictionaryFiles = ['./dictionary.csv'];
            const responses = await Promise.all(
                dictionaryFiles.map(file => fetch(file))
            );

            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`辞書ファイル (${response.url}) の読み込みに失敗しました: ${response.statusText}`);
                }
            }

            let combinedDictionary = {};
            const dictionaryCsvTexts = await Promise.all(responses.map(res => res.text()));
            dictionaryCsvTexts.forEach(text => {
                const parsedDict = parseDictionary(text);
                Object.assign(combinedDictionary, parsedDict);
            });
            baseDictionary = JSON.parse(JSON.stringify(combinedDictionary));
            dictionary = JSON.parse(JSON.stringify(baseDictionary));

            const convertBtn = document.getElementById('convert-btn');
            const outputArea = document.getElementById('output-area');
            const inputArea = document.getElementById('input-area');
            const useDictionaryCheckbox = document.getElementById('use-dictionary-checkbox');

            convertBtn.addEventListener('click', function () {
                const useDictionary = useDictionaryCheckbox.checked;
                const pairs = getAllPairs();
                let inputText = inputArea.value;
                let outputText = inputText;
                const placeholders = {};
                let placeholderCounter = 0;
                let currentDictionary = {};

                function escapeRegExp(string) {
                    return string.replace(/[.*+?^${}()|[\\\]]/g, '\\$&');
                }

                if (useDictionary) {
                    currentDictionary = JSON.parse(JSON.stringify(baseDictionary));

                    const dynamicInputs = dynamicDictContainer.querySelectorAll('.dynamic-dict-item input');
                    const dynamicGroupWords = [];
                    dynamicInputs.forEach(input => {
                        const word = input.value.trim();
                        if (word) {
                            dynamicGroupWords.push(word);
                        }
                    });

                    if (dynamicGroupWords.length > 0) {
                        const uniqueDynamicWords = [...new Set(dynamicGroupWords)];
                        const existingKeys = Object.keys(currentDictionary);
                        existingKeys.forEach(key => {
                            const currentWords = Array.isArray(currentDictionary[key]) ? currentDictionary[key] : [];
                            const updatedWords = [...new Set([...currentWords, ...uniqueDynamicWords])];
                            currentDictionary[key] = updatedWords;
                        });

                        const firstExistingKey = existingKeys[0];
                        const finalWordList = firstExistingKey ? currentDictionary[firstExistingKey] : uniqueDynamicWords;

                        uniqueDynamicWords.forEach(newWord => {
                            currentDictionary[newWord] = [...finalWordList];
                        });
                    }

                    pairs.forEach((pair, index) => {
                        const minimalInput = pair.input1.trim();
                        const replacement = pair.input2;
                        const highlightClass = pair.isKeyword ? 'highlight-keyword' : 'highlight';
                        const replacementSpan = `<span class="${highlightClass}">${replacement}</span>`;

                        if (minimalInput && currentDictionary[minimalInput]) {
                            const groupWords = currentDictionary[minimalInput];
                            const longerWords = groupWords.filter(word => word !== minimalInput);

                            longerWords.forEach(longWord => {
                                const placeholder = `__PLACEHOLDER_${placeholderCounter++}__`;
                                placeholders[placeholder] = longWord;
                                const regex = new RegExp(escapeRegExp(longWord), 'g');
                                outputText = outputText.replace(regex, placeholder);
                            });

                            const minimalRegex = new RegExp(escapeRegExp(minimalInput), 'g');
                            outputText = outputText.replace(minimalRegex, replacementSpan);

                        } else if (minimalInput) {
                            const regex = new RegExp(escapeRegExp(minimalInput), 'g');
                            outputText = outputText.replace(regex, replacementSpan);
                        }
                    });

                    Object.keys(placeholders).forEach(placeholder => {
                        const originalWord = placeholders[placeholder];
                        const placeholderRegex = new RegExp(escapeRegExp(placeholder), 'g');
                        outputText = outputText.replace(placeholderRegex, originalWord);
                    });

                } else {
                    const dynamicInputs = dynamicDictContainer.querySelectorAll('.dynamic-dict-item input');
                    const dynamicGroupWords = [];
                    dynamicInputs.forEach(input => {
                        const word = input.value.trim();
                        if (word) {
                            dynamicGroupWords.push(word);
                        }
                    });

                    const pairWords = pairs.map(p => p.input1.trim()).filter(w => w);
                    const allWords = [...new Set([...dynamicGroupWords, ...pairWords])];
                    const sortedWords = allWords.sort((a, b) => b.length - a.length);

                    const placeholders = {};
                    let placeholderCounter = 0;

                    sortedWords.forEach(word => {
                        if (word) {
                            const placeholder = `__TEMP_PLACEHOLDER_${placeholderCounter++}__`;
                            placeholders[placeholder] = word;
                            const regex = new RegExp(escapeRegExp(word), 'g');
                            outputText = outputText.replace(regex, placeholder);
                        }
                    });

                    const replacedPlaceholders = new Set();

                    pairs.forEach(pair => {
                        const input1 = pair.input1.trim();
                        if (input1) {
                            const replacement = pair.input2;
                            const highlightClass = pair.isKeyword ? 'highlight-keyword' : 'highlight';
                            const replacementSpan = `<span class="${highlightClass}">${replacement}</span>`;

                            Object.keys(placeholders).forEach(p => {
                                if (placeholders[p] === input1) {
                                    const placeholderRegex = new RegExp(escapeRegExp(p), 'g');
                                    outputText = outputText.replace(placeholderRegex, replacementSpan);
                                    replacedPlaceholders.add(p);
                                }
                            });
                        }
                    });

                    Object.keys(placeholders).forEach(p => {
                        if (!replacedPlaceholders.has(p)) {
                            const originalWord = placeholders[p];
                            const placeholderRegex = new RegExp(escapeRegExp(p), 'g');
                            outputText = outputText.replace(placeholderRegex, originalWord);
                        }
                    });
                }

                outputArea.innerHTML = outputText;
            });

        } catch (error) {
            console.error('初期化中にエラーが発生しました:', error);
            alert('辞書ファイルの読み込みに失敗しました。');
        }
    }

    initializeApp();

    // --- CSVエクスポート機能 ---
    const exportCsvBtn = document.getElementById('export-csv-btn');
    exportCsvBtn.addEventListener('click', function () {
        const pairs = getAllPairs();
        if (pairs.length === 0) {
            M.toast({ html: 'エクスポートするペアがありません。' });
            return;
        }

        function escapeCsvFieldWithNewline(field) {
            if (field === null || field === undefined) {
                return '';
            }
            let stringField = String(field);
            stringField = stringField.replace(/\r\n|\r|\n/g, '__NEWLINE__');
            stringField = stringField.replace(/"/g, '""');
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('__NEWLINE__')) {
                stringField = `"${stringField}"`;
            }
            return stringField;
        }

        const csvRows = pairs.map(pair => {
            const escapedInput1 = escapeCsvFieldWithNewline(pair.input1);
            const escapedInput2 = escapeCsvFieldWithNewline(pair.input2);
            return `${escapedInput1},${escapedInput2}`;
        });

        const csvContent = csvRows.join('\n');
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversion_pairs.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        M.toast({ html: 'ペア情報をCSVで保存しました。' });
    });

    // --- CSVインポート機能 ---
    const importCsvFile = document.getElementById('import-csv-file');
    importCsvFile.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const csvText = e.target.result;
                try {
                    function parseCsvRow(rowString) {
                        const fields = [];
                        let currentField = '';
                        let inQuotes = false;
                        for (let i = 0; i < rowString.length; i++) {
                            const char = rowString[i];
                            if (char === '"') {
                                if (inQuotes && i + 1 < rowString.length && rowString[i + 1] === '"') {
                                    currentField += '"';
                                    i++;
                                }
                            } else if (char === ',' && !inQuotes) {
                                fields.push(currentField);
                                currentField = '';
                            } else {
                                currentField += char;
                            }
                        }
                        fields.push(currentField);
                        return fields.map(field => {
                            if (field.startsWith('"') && field.endsWith('"')) {
                                let unquotedField = field.substring(1, field.length - 1);
                                return unquotedField.replace(/""/g, '"');
                            }
                            return field;
                        }).map(field => field.replace(/__NEWLINE__/g, '\n'));
                    }

                    pairContainer.innerHTML = '';
                    pairCounter = 0;

                    const rows = csvText.trim().split('\n');
                    rows.forEach(rowStr => {
                        if (rowStr.trim() === '') return;
                        const [input1, input2] = parseCsvRow(rowStr.trim());
                        createAndAppendPairElement(pairCounter++, input1 !== undefined ? input1 : '', input2 !== undefined ? input2 : '');
                    });
                    M.updateTextFields();
                    M.toast({ html: 'CSVからペア情報を読み込みました。' });
                } catch (error) {
                    console.error("CSVの解析に失敗しました:", error);
                    M.toast({ html: 'CSVファイルの形式が正しくない可能性があります。' });
                }
                event.target.value = null;
            };
            reader.readAsText(file, 'UTF-8');
        }
    });

    // --- TXTエクスポート機能 ---
    const exportTxtBtn = document.getElementById('export-txt-btn');
    exportTxtBtn.addEventListener('click', function () {
        const title = document.getElementById('output-title').value;
        const comment = document.getElementById('output-comment').value;
        const result = document.getElementById('output-result').value;
        const originalText = document.getElementById('input-area').value;
        const modifiedText = document.getElementById('output-area').innerText; // HTMLタグを含まないテキストを取得

        const pairs = getAllPairs();
        const keywords = pairs.filter(p => p.isKeyword).map(p => p.input1).join(', ');

        const outputContent = `
【題名】
${title}

[コメント]
${comment}
[結果]
${result}
--------------------------------------
[キーワード]
${keywords}
-------------
[改変前の文]
${originalText}

[改変後の文]
${modifiedText}
        `;

        const blob = new Blob([outputContent.trim()], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'output'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        M.toast({ html: '結果をTXTファイルで保存しました。' });
    });

});
