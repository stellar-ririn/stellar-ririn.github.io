document.addEventListener('DOMContentLoaded', function() {
    // Materializeのコンポーネントを初期化 (Textareaなど)
    M.AutoInit();

    const addPairBtn = document.getElementById('add-pair-btn');
    const pairContainer = document.getElementById('pair-container');
    let pairCounter = 1; // 追加されるペアのID用カウンター

    addPairBtn.addEventListener('click', function() {
      const newPairId = pairCounter++; // 新しいペアのインデックス

      // 新しいペアのHTML要素を作成
      const newPairHtml = `
        <div class="row pair-item">
          <div class="col s5">
            <div class="input-field">
              <input id="pair-input-1-${newPairId}" type="text" class="validate">
              <label for="pair-input-1-${newPairId}">入力1</label>
            </div>
          </div>
          <div class="col s2 pair-arrow">
            <span>ー＞</span>
          </div>
          <div class="col s5">
            <div class="input-field">
              <input id="pair-input-2-${newPairId}" type="text" class="validate">
              <label for="pair-input-2-${newPairId}">入力2</label>
            </div>
          </div>
        </div>
      `;

      // 作成したHTMLをコンテナに追加
      pairContainer.insertAdjacentHTML('beforeend', newPairHtml);

      // Materializeのinput fieldは動的に追加された場合、ラベルの再計算が必要な場合がある
      // M.updateTextFields(); // 必要に応じて呼び出す (今回はinputなので不要かも)
    });

    // --- ここから下に、各要素を操作するJavaScriptコードを追加できます ---

    // 例: 入力欄の内容を取得する
    const inputArea = document.getElementById('input-area');
    // console.log(inputArea.value);

    // 例: 出力欄にテキストを設定する
    const outputArea = document.getElementById('output-area');
    // outputArea.value = "ここに結果を表示";
    // M.textareaAutoResize(outputArea); // 内容変更後に高さを再計算

    // 例: 特定の入力ペアの値を取得する (例: 最初のペア)
    const pairInput1_0 = document.getElementById('pair-input-1-0');
    const pairInput2_0 = document.getElementById('pair-input-2-0');
    // console.log(pairInput1_0.value, pairInput2_0.value);

    // 例: 動的に追加されたペアの値を取得する (例: IDが1のペア)
    // const pairInput1_1 = document.getElementById('pair-input-1-1'); // ボタンクリック後
    // const pairInput2_1 = document.getElementById('pair-input-2-1'); // ボタンクリック後
    // if (pairInput1_1) { // 要素が存在するか確認
    //   console.log(pairInput1_1.value, pairInput2_1.value);
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
    // console.log(getAllPairs()); // 現在の全ペアの値を出力

  });