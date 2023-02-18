/**
 * Global App configuration
 */

const AppConfig = {
    api: {
        baseUrl: process.env.BASEURL,
        routes: {
            authorise: '/authorise', // todo: distinct between api and frontend routes?
            refreshToken: '/refreshtoken',
            login: '/login',
            logout: '/logout',
            about_me: '/page/about-me',
            platforms: '/platforms',
            reviews: '/reviews',
            games: '/games',
            admin: '/admin'
        },
        accessTokenTimeToLive: '5s',
        refreshTokenTimeToLive: '10m'
    },
    global: {
        alertTimeout: 3000,
        stickyNavThreshold: 150,
    },
    ckEditorConfiguration: {
        toolbar: {
            items: [
                'heading',
                '|',
                'undo',
                'redo',
                '|',
                'bold',
                'italic',
                'specialCharacters',
                'link',
                'code',
                'bulletedList',
                'numberedList',
                '|',
                'indent',
                'outdent',
                '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                '|',
                'htmlEmbed',
                'codeBlock'
            ]
        },
        language: 'en',
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:full',
                'imageStyle:side'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        }
    }
};

export default AppConfig;
