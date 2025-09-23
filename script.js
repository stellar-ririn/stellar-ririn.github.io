document.addEventListener('DOMContentLoaded', function () {

    // 対象のリンク要素を取得します
    const httpMessageLink = document.querySelector('a.firstMess[href="https://www.kamisira.shop/"]');
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
      <div class="row pair-item"> <!-- インラインのmargin-bottom削除 -->
        <div class="col s12 m5"> <!-- スマホではs12, タブレット以上でm5 -->
          <div class="input-field">
            <input id="pair-input-1-${id}" type="text" class="validate" value="${escapeAttributeValue(beforeVal)}">
            <label for="pair-input-1-${id}" class="${beforeVal ? 'active' : ''}">${labelIndex}つ目の修正元</label>
          </div>
        </div>
        <div class="col s12 m2 pair-arrow"> <!-- スマホではs12, タブレット以上でm2 -->
          <i class="material-icons hide-on-med-and-up">arrow_downward</i> <!-- スマホでは下向き矢印 -->
          <span class="hide-on-small-only">></span> <!-- スマホ以外では > -->
        </div>
        <div class="col s12 m5"> <!-- スマホではs12, タブレット以上でm5 -->
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
        // 最初のペア(id=0)がHTMLに静的に存在するため、pairCounterは追加する次のIDを指す
        // pairContainer.children.length を使うと、現在のペアの数に基づいて次のIDを決定できる
        // ただし、CSVインポートでクリアする場合を考慮し、グローバルなpairCounterを維持する
        // 静的なペアが0なので、最初の追加はID 1 になるように pairCounter は 1 で初期化済み
        createAndAppendPairElement(pairCounter++);
        M.updateTextFields(); // 新しい要素が追加された後にラベルを更新
    });

    // --- 動的辞書グループの初期入力欄生成 & 追加ボタン ---
    let dynamicDictCounter = 0; // ID用のカウンター (0から開始)

    // 初期表示時に最初のペアのラベルがアクティブになるようにする
    M.updateTextFields();

    function addDynamicDictInput(index) {
        // 行判定ロジックを削除し、常に新しい入力欄をコンテナに追加する
        // CSSのクラスで折り返しを制御する (s6: スマホ2列, m4: タブレット3列, l3: PC4列)
        const newDynamicInputHtml = `
        <div class="col s6 m4 l3 input-field dynamic-dict-item"> <!-- レスポンシブクラスに変更 -->
          <input id="dynamic-dict-input-${index}" type="text" class="validate">
          <label for="dynamic-dict-input-${index}">単語 ${index + 1}</label>
        </div>
    `;
        // #dynamic-dict-container に直接追加
        dynamicDictContainer.insertAdjacentHTML('beforeend', newDynamicInputHtml);
        // Materializeのラベル更新 (動的追加時に必要)
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

    // 例: 入力欄の内容を取得する
    const inputArea = document.getElementById('input-area');
    // //console.log(inputArea.value);

    // 例: 出力欄にテキストを設定する
    const outputArea = document.getElementById('output-area');
    // outputArea.value = "ここに結果を表示";
    // M.textareaAutoResize(outputArea); // 内容変更後に高さを再計算

    // 例: 特定の入力ペアの値を取得する (例: 最初のペア)
    const pairInput1_0 = document.getElementById('pair-input-1-0');
    const pairInput2_0 = document.getElementById('pair-input-2-0');
    // //console.log(pairInput1_0.value, pairInput2_0.value);

    // 例: 動的に追加されたペアの値を取得する (例: IDが1のペア)
    // const pairInput1_1 = document.getElementById('pair-input-1-1'); // ボタンクリック後
    // const pairInput2_1 = document.getElementById('pair-input-2-1'); // ボタンクリック後
    // if (pairInput1_1) { // 要素が存在するか確認
    //   //console.log(pairInput1_1.value, pairInput2_1.value);
    // }

    // 例: すべての入力ペアの値を取得する
    function getAllPairs() {
        const pairs = [];
        const pairItems = pairContainer.querySelectorAll('.pair-item');
        pairItems.forEach((item, index) => {
            const input1 = item.querySelector(`input[id^="pair-input-1-"]`);
            const input2 = item.querySelector(`input[id^="pair-input-2-"]`);
            if (input1 && input2) {
                pairs.push({ input1: input1.value, input2: input2.value });
            }
        });
        return pairs;
    }
    // //console.log(getAllPairs()); // 現在の全ペアの値を出力

    // --- 変換機能の追加 ---
    let dictionary = {}; // 辞書データを格納する変数 (非同期で読み込むため let で宣言) - これはOK
    let baseDictionary = {}; // dictionary.csv から読み込んだ元の辞書を保持する変数

    function parseDictionary(csvString) {
        const parsedDict = {};
        const lines = csvString.trim().split('\n');
        lines.forEach(line => {
            const words = line.split(',').map(word => word.trim()).filter(word => word !== '');
            if (words.length >= 2) {
                // 2番目以降を最小構成/関連語とし、それらをキーにする
                // 値はその行のすべての単語リスト
                for (let i = 1; i < words.length; i++) {
                    const minimalForm = words[i];
                    if (!parsedDict[minimalForm]) {
                        parsedDict[minimalForm] = words; // グループ全体のリストを格納
                    } else {
                        // 既に別のグループで同じ最小構成が定義されている場合の処理（必要なら）
                        // console.warn(`辞書に重複キー: ${minimalForm}`);
                        // ここでは単純に上書きせず、最初に見つかったグループを採用
                    }
                }
            }
        });
        // //console.log("Parsed Dictionary:", dictionary);
        return parsedDict; // ★★★ 解析結果の parsedDict を返すように修正 ★★★
    }

    // const dictionary = parseDictionary(dictionaryCsv); // ★★★ この行を削除 ★★★

    // --- 辞書ファイルの読み込みと変換ボタンのイベントリスナー設定 ---
    async function initializeApp() {
        try {
            // --- 辞書ファイル(dictionary.csv)を読み込む ---
            const dictionaryFiles = ['./dictionary.csv']; // dictionary2.csv を削除
            const responses = await Promise.all(
                dictionaryFiles.map(file => fetch(file))
            ); // これで responses は dictionary.csv の結果のみ含む配列になる

            // すべてのレスポンスが成功したかチェック
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`辞書ファイル (${response.url}) の読み込みに失敗しました: ${response.statusText}`);
                }
            }

            // dictionary.csvの内容をテキストとして取得し、解析
            let combinedDictionary = {};
            const dictionaryCsvTexts = await Promise.all(responses.map(res => res.text()));
            dictionaryCsvTexts.forEach(text => {
                const parsedDict = parseDictionary(text);
                // Object.assignを使って結合 (今回はファイルが1つなので、そのまま代入でも良い)
                Object.assign(combinedDictionary, parsedDict);
            });
            // baseDictionary に初期辞書をディープコピーして保存
            baseDictionary = JSON.parse(JSON.stringify(combinedDictionary));
            // dictionary も初期化 (最初は baseDictionary と同じ)
            dictionary = JSON.parse(JSON.stringify(baseDictionary)); // 初期状態を設定

            // 辞書の準備ができたので、変換ボタンの要素を取得し、イベントリスナーを設定
            const convertBtn = document.getElementById('convert-btn'); // ★★★ ここで取得 ★★★
            const outputArea = document.getElementById('output-area'); // outputAreaもここで取得すると良い
            const inputArea = document.getElementById('input-area');   // inputAreaもここで取得すると良い
            const useDictionaryCheckbox = document.getElementById('use-dictionary-checkbox'); // チェックボックスを取得

            convertBtn.addEventListener('click', function () { // ★★★ イベントリスナーの設定をここへ移動 ★★★
                //console.log("--- 変換開始 ---");

                const useDictionary = useDictionaryCheckbox.checked;
                const pairs = getAllPairs();
                let inputText = inputArea.value;
                let outputText = inputText;
                const placeholders = {}; // プレースホルダーは辞書使用時のみ
                let placeholderCounter = 0;
                let currentDictionary = {}; // この変換処理で使う辞書オブジェクト

                // 正規表現の特殊文字をエスケープする関数
                function escapeRegExp(string) {
                    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }

                if (useDictionary) {
                    // --- 辞書ファイルを使用する場合の処理 ---
                    //console.log("辞書ファイルを使用するモード");

                    // 1. 辞書のリセットと動的辞書の統合
                    currentDictionary = JSON.parse(JSON.stringify(baseDictionary)); // baseからコピー
                    //console.log("辞書をリセット:", currentDictionary);

                    const dynamicInputs = dynamicDictContainer.querySelectorAll('.dynamic-dict-item input');
                    const dynamicGroupWords = [];
                    dynamicInputs.forEach(input => {
                        const word = input.value.trim();
                        if (word) {
                            dynamicGroupWords.push(word);
                        }
                    });

                    if (dynamicGroupWords.length > 0) {
                        //console.log("動的辞書グループの単語:", dynamicGroupWords);
                        const uniqueDynamicWords = [...new Set(dynamicGroupWords)];

                        const existingKeys = Object.keys(currentDictionary);
                        existingKeys.forEach(key => {
                            const currentWords = Array.isArray(currentDictionary[key]) ? currentDictionary[key] : [];
                            const updatedWords = [...new Set([...currentWords, ...uniqueDynamicWords])]; // 動的単語を追加
                            currentDictionary[key] = updatedWords;
                        });

                        const firstExistingKey = existingKeys[0];
                        const finalWordList = firstExistingKey ? currentDictionary[firstExistingKey] : uniqueDynamicWords;

                        uniqueDynamicWords.forEach(newWord => {
                            currentDictionary[newWord] = [...finalWordList]; // 新しい配列としてコピー
                        });
                        //console.log("動的グループで更新された辞書:", currentDictionary);
                    }

                    // 2. ペアに基づく置換 (辞書とプレースホルダーを使用)
                    pairs.forEach((pair, index) => {
                        const minimalInput = pair.input1.trim();
                        const replacement = pair.input2;
                        const replacementSpan = `<span class="highlight">${replacement}</span>`;

                        if (minimalInput && currentDictionary[minimalInput]) {
                            //console.log(`  ペア ${index}: 辞書キーあり => グループ置換 (プレースホルダー使用)`);
                            const groupWords = currentDictionary[minimalInput];
                            const longerWords = groupWords.filter(word => word !== minimalInput);

                            // 2a. 最小構成以外の単語をプレースホルダーに置換
                            longerWords.forEach(longWord => {
                                const placeholder = `__PLACEHOLDER_${placeholderCounter++}__`;
                                placeholders[placeholder] = longWord;
                                const regex = new RegExp(escapeRegExp(longWord), 'g');
                                outputText = outputText.replace(regex, placeholder);
                            });

                            // 2b. 最小構成の単語を置換
                            const minimalRegex = new RegExp(escapeRegExp(minimalInput), 'g');
                            outputText = outputText.replace(minimalRegex, replacementSpan);

                        } else if (minimalInput) {
                            //console.log(`  ペア ${index}: 辞書キーなし => 単純置換`);
                            const regex = new RegExp(escapeRegExp(minimalInput), 'g');
                            outputText = outputText.replace(regex, replacementSpan);
                        }
                    });

                    // 3. プレースホルダーを元に戻す
                    Object.keys(placeholders).forEach(placeholder => {
                        const originalWord = placeholders[placeholder];
                        const placeholderRegex = new RegExp(escapeRegExp(placeholder), 'g');
                        outputText = outputText.replace(placeholderRegex, originalWord);
                    });

                } else {
                    // --- 辞書ファイルを使用しない場合の処理 (動的辞書グループのみ考慮) ---
                    // ★★★ 再修正: 動的辞書グループの単語を保護するモード ★★★
                    //console.log("辞書ファイルを使用しないモード (動적辞書保護)");

                    // 1. 保護対象の動的辞書単語を取得
                    currentDictionary = {}; // このモードでは辞書オブジェクトは直接使わない
                    const dynamicInputs = dynamicDictContainer.querySelectorAll('.dynamic-dict-item input');
                    const dynamicPlaceholders = {}; // 動的単語用プレースホルダー管理
                    let dynamicPlaceholderCounter = 0;
                    const dynamicGroupWords = [];
                    dynamicInputs.forEach(input => {
                        const word = input.value.trim(); // trimして取得
                        if (word) {
                            dynamicGroupWords.push(word);
                        }
                    });

                    // 重複を除去し、長い単語から処理するためにソート
                    const uniqueDynamicWords = [...new Set(dynamicGroupWords)];
                    const sortedDynamicWords = uniqueDynamicWords.sort((a, b) => b.length - a.length);
                    //console.log("保護対象の動的辞書単語 (ソート済):", sortedDynamicWords);

                    // 2. 保護対象の動的辞書単語をプレースホルダーに置換
                    //console.log("保護対象の動的辞書単語をプレースホルダー化");
                    sortedDynamicWords.forEach(word => {
                        // ★★★ wordが空文字でないことを確認 ★★★
                        if (word) {
                            const placeholder = `__DYNAMIC_WORD_${dynamicPlaceholderCounter++}__`;
                            dynamicPlaceholders[placeholder] = word; // 元の単語を記録
                            const regex = new RegExp(escapeRegExp(word), 'g');
                            outputText = outputText.replace(regex, placeholder);
                            //console.log(`  ${word} -> ${placeholder}`);
                        }
                    });
                    // //console.log("プレースホルダー化後のテキスト:", outputText.substring(0, 100)); // デバッグ用

                    // 3. 全ての修正ペアで置換処理 (プレースホルダーを考慮)
                    //console.log("全ての修正ペアを処理 (プレースホルダー考慮)");
                    pairs.forEach((pair, index) => {
                        const input1 = pair.input1.trim();
                        const replacement = pair.input2;
                        const replacementSpan = `<span class="highlight">${replacement}</span>`;

                        if (input1) {
                            let replacedPlaceholder = false;
                            // 修正元が、プレースホルダー化された動的単語の元の形に一致するかチェック
                            Object.keys(dynamicPlaceholders).forEach(placeholder => {
                                if (dynamicPlaceholders[placeholder] === input1) {
                                    // 修正元が保護対象の動的単語そのものだった場合
                                    //console.log(`  ペア ${index}: 動的単語一致 (${input1}) -> プレースホルダー (${placeholder}) を置換`);
                                    const placeholderRegex = new RegExp(escapeRegExp(placeholder), 'g');
                                    outputText = outputText.replace(placeholderRegex, replacementSpan);
                                    // このプレースホルダーは処理済みなので、後で元に戻さないように削除
                                    delete dynamicPlaceholders[placeholder];
                                    replacedPlaceholder = true;
                                }
                            });

                            if (!replacedPlaceholder) {
                                // 修正元が保護対象の動的単語ではなかった場合、通常の置換
                                //console.log(`  ペア ${index}: 通常置換 ${input1} -> ${replacement}`);
                                const regex = new RegExp(escapeRegExp(input1), 'g');
                                // この置換はプレースホルダーには影響しない
                                outputText = outputText.replace(regex, replacementSpan);
                            }
                        }
                    });

                    // 4. 残っているプレースホルダーを元の単語に戻す
                    //console.log("残りのプレースホルダーを元の単語に戻す");
                    Object.keys(dynamicPlaceholders).forEach(placeholder => {
                        const originalWord = dynamicPlaceholders[placeholder];
                        //console.log(`  ${placeholder} -> ${originalWord}`);
                        const placeholderRegex = new RegExp(escapeRegExp(placeholder), 'g');
                        outputText = outputText.replace(placeholderRegex, originalWord);
                    });
                }

                outputArea.innerHTML = outputText; // valueではなくinnerHTMLに設定
            });

        } catch (error) {
            console.error('初期化中にエラーが発生しました:', error);
            // エラーメッセージをユーザーに表示
            alert('辞書ファイルの読み込みに失敗しました。');
        }
    }

    // アプリケーションの初期化を実行
    initializeApp(); // ★★★ この関数を呼び出す ★★★

    // --- CSVエクスポート機能 ---
    const exportCsvBtn = document.getElementById('export-csv-btn');
    exportCsvBtn.addEventListener('click', function () {
        const pairs = getAllPairs();
        if (pairs.length === 0) {
            M.toast({ html: 'エクスポートするペアがありません。' });
            return;
        }

        // CSVフィールドをエスケープする関数 (改行を __NEWLINE__ に置換)
        function escapeCsvFieldWithNewline(field) {
            if (field === null || field === undefined) {
                return '';
            }
            let stringField = String(field);
            // 改行コードを特殊なマーカーに置換
            stringField = stringField.replace(/\r\n|\r|\n/g, '__NEWLINE__');
            // ダブルクォートを "" (2つのダブルクォート) に置換
            stringField = stringField.replace(/"/g, '""');
            // フィールドにカンマ、ダブルクォート、または改行マーカーが含まれる場合、全体をダブルクォートで囲む
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
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
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
                    // 簡易CSV行パーサー (フィールド内のカンマとダブルクォートに対応)
                    // 改行マーカー __NEWLINE__ はこの時点ではそのまま
                    function parseCsvRow(rowString) {
                        const fields = [];
                        let currentField = '';
                        let inQuotes = false;
                        for (let i = 0; i < rowString.length; i++) {
                            const char = rowString[i];
                            if (char === '"') {
                                if (inQuotes && i + 1 < rowString.length && rowString[i + 1] === '"') {
                                    currentField += '"'; // エスケープされたダブルクォート
                                    i++; // 次の文字をスキップ
                                } else {
                                    inQuotes = !inQuotes;
                                }
                            } else if (char === ',' && !inQuotes) {
                                fields.push(currentField);
                                currentField = '';
                            } else {
                                currentField += char;
                            }
                        }
                        fields.push(currentField); // 最後のフィールドを追加
                        return fields.map(field => {
                            if (field.startsWith('"') && field.endsWith('"')) {
                                let unquotedField = field.substring(1, field.length - 1);
                                return unquotedField.replace(/""/g, '"'); // 内部の "" を " に戻す
                            }
                            return field;
                        }).map(field => field.replace(/__NEWLINE__/g, '\n')); // __NEWLINE__ を実際の改行に戻す
                    }

                    pairContainer.innerHTML = ''; // 既存のペアをクリア
                    pairCounter = 0; // ペアカウンターをリセット (最初のペアのIDが0になるように)

                    const rows = csvText.trim().split('\n');
                    rows.forEach(rowStr => {
                        if (rowStr.trim() === '') return; // 空行はスキップ
                        const [input1, input2] = parseCsvRow(rowStr.trim());
                        createAndAppendPairElement(pairCounter++, input1 !== undefined ? input1 : '', input2 !== undefined ? input2 : '');
                    });
                    M.updateTextFields(); // Materializeのラベルなどを更新
                    M.toast({ html: 'CSVからペア情報を読み込みました。' });
                } catch (error) {
                    console.error("CSVの解析に失敗しました:", error);
                    M.toast({ html: 'CSVファイルの形式が正しくない可能性があります。' });
                }
                // 同じファイルを再度選択できるように値をクリア
                event.target.value = null;
            };
            reader.readAsText(file, 'UTF-8'); // UTF-8として読み込み
        }
    });

});