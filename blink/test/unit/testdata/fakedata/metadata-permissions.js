blink.app.fakeData['/callosum/v1/security'] = {
    'a' : {
        permissions : [
            {
                shareMode: "MODIFY",
                dependents : [
                    {
                        id : 'tbcolumn',
                        shareMode : 'MODIFY'
                    },
                    {
                        id : 'tbcolumn',
                        shareMode : 'MODIFY'
                    }
                ]
            }
        ]
    },
    'b' : {
        permissions : [
            {
                shareMode: "READ_ONLY",
                dependents : []
            }
        ]
    },
    'c' : {
        permissions : [
            {
                shareMode: "MODIFY",
                dependents : []
            }
        ]
    },
    'd' : {
        permissions : [
            {
                shareMode: "MODIFY",
                dependents : [
                    {
                        id : 'wkcolumn',
                        shareMode : 'MODIFY'
                    },
                    {
                        id : 'tbcolumn',
                        shareMode : 'NO_ACCESS'
                    }
                ]
            }
        ]
    },
    'e' : {
        permissions : [
            {
                shareMode: "READ_ONLY",
                dependents : [
                    {
                        id : 'wkcolumn',
                        shareMode : 'MODIFY'
                    },
                    {
                        id : 'tbcolumn',
                        shareMode : 'NO_ACCESS'
                    }
                ]
            }
        ]
    }
};