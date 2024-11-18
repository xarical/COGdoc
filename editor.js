require.config({paths: {'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs'}});

require(['vs/editor/editor.main'], function() {
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
    const myself = Math.random();
    let flag = false; 

    function normalizeContent(content) {
        return content.replace(/\r\n/g, '\n').trim();
    }

    function fetchContent() {
        fetch('/content', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => { 
            if (!response.ok) {
                throw new Error('Whoops, something went wrong');
            } else {
                return response.json()
            }    
        })
        .then(data => {
            const currentContent = editor.getValue();
            let hasChanged = normalizeContent(currentContent) !== normalizeContent(data.content)
            
            if (hasChanged && myself != data.lastEditor) {
                flag = true;
                const selection = editor.getSelection();
                const model = editor.getModel();
                model.pushEditOperations(
                        [],
                        [
                            {
                                range: model.getFullModelRange(),
                                text: data.content,
                            }
                        ]
                    );
                editor.setSelection(selection);
            }
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const fetchDelay = 1000
    function fetchContentLoop() {
        (function loop() {
            setTimeout(() => {
                fetchContent();
                loop();
            }, fetchDelay);
        })();
    }
    fetchContentLoop();

    editor.onDidChangeModelContent(function() {
        if (flag){
            flag = false;
            return;
        } else {
            fetch('/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        code: editor.getValue(),
                        iam: myself
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Whoops, something went wrong');
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
    });
});