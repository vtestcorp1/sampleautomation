blink.app.fakeData['formulaAssistant'] =
{
    children:
    [
            { value: 'Operators', children: [
                {
                    value: 'and',
                    displayValue: 'andTest',
                    type: 'operator',
                    children: [{
                        type: 'helpText',
                        value: 'Returns true when both conditions are true, otherwise returns false.'
                    }, {
                        type: 'fixedExample',
                        value: [{
                            value: '('
                        }]
                    }, {
                        type: 'queryExample',
                        value: [{
                            value: 'lastname', type: 'attribute'
                        }]
                    }]
                },
                {
                    value: 'or',
                    type: 'operator',
                    children: [{
                        type: 'helpText',
                        value: 'Returns true when both conditions are true, otherwise returns false.'
                    }, {
                        type: 'fixedExample',
                        value: [{
                            value: '('
                        }]
                    }, {
                        type: 'queryExample',
                        value: [{
                            value: 'lastname', type: 'attribute'
                        }]
                    }]
                }
            ]
        }
    ]
};