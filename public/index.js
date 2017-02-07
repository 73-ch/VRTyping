let typing;
let textMesh1;

var text = "three.js",
    height = 1,
    size = 1,
    hover = 1,
    curveSegments = 10,
    bevelThickness = 2,
    bevelSize = 1.5,
    bevelSegments = 3,
    bevelEnabled = true,
    font = undefined,
    fontName = "helvetiker", // helvetiker, optimer, gentilis, droid sans, droid serif
    fontWeight = "bold";

window.onload = () => {
    loadFont().then(() => {
        main();
    });
};

let loadFont = () => {
    return new Promise((resolve) => {
        let loader = new THREE.FontLoader();
        loader.load('../font/helvetiker_bold.typeface.json', function (response) {
            font = response;
            resolve(true);
        });
    });
};

let main = () => {
    loadFont();
    alert("test");
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // var controls = new THREE.OrbitControls(camera);
    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

// VR用コントローラを生成
//     let controls = new THREE.VRControls(camera);

// VR用エフェクトを生成（2分割の画面を構築する）
    let effect = new THREE.VREffect(renderer);
    // effect.setSize(window.innerWidth, window.innerHeight);

// VRマネージャの生成
//     let manager = new WebVRManager(renderer, effect);

    group = new THREE.Group();
    scene.add(group);

    camera.position.z = 5;

    typing = new Typing(scene, group);
    typing.start();

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 5).normalize();
    scene.add(light);

    window.THREE = THREE;
    window.scene = scene;

    let count = 0;

    function render() {
        count ++;
        requestAnimationFrame(render);
        renderer.clear();
        for (let i = 0; i < group.children.length; i++) {
            group.children[i].position.z = 10 * Math.sin(count / 100 + i) - 5;
        }
        // controls.update();
        // manager.render(scene, camera, count);
        renderer.render(scene, camera);
    }

    App.room = App.cable.subscriptions.create("RoomChannel", {
        connected: function() {},
        disconnected: function() {},
        received: function(data) {
            console.log(data["key"]);
            typing.check(data["key"]["keyCode"], data["key"]["shift"]);
        }
    });

    render();
};


class Typing {
    /*
     this.second : プレイタイム
     this.right_count : 正解文字数
     this.wrong_count : 誤打数
     this.word : 現在の問題
     this.now_char : 今打っている文章の何文字目か
     */
    constructor(scene, group) {
        this.right_count = 0;
        this.wrong_count = 0;
        this.second = 60;
        this.now_char = 0;
        this.word = "";
        this.scene = scene;
        this.group = group;

        this.q = null;
        this.scene.add(this.q);
    }

    start() {
        this.question();
        this.count();
    }

    count() {
        if (this.second == 0) {
            this.end();
            return false;
        }
        this.second--;
        setTimeout(() => this.count(), 1000);
    }

    end() {
        console.log("right" + this.right_count);
        console.log('wrong' + this.wrong_count);
    }

    check(code, shift) {
        let select_char = char[code][Number(shift)];
        if (!select_char)return;
        if (this.word.charAt(this.now_char) == select_char) {
            this.right(select_char);
        } else {
            this.miss();
        }
    }

    right(char) {
        console.log(this.group);
        this.now_char++;
        this.right_count++;
        this.createText(char, "press");
        if (this.now_char == this.word.length) this.question();
    }

    miss() {
        this.wrong_count++;
    }

    question() {
        this.word = questions[Math.floor(Math.random() * questions.length)].toUpperCase();
        this.now_char = 0;
        console.log('question : ' + this.word);
        this.createText(this.word, "question");
    }

    createText(text, type) {
        let textGeo = new THREE.TextGeometry(text, {
            font: font,
            size: size,
            height: height,
            curveSegments: curveSegments,
            material: 0,
            extrudeMaterial: 1
        });
        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();
        let color;
        if (type === "press") {
            color = parseInt(Math.floor(Math.random() * 16777216));
        } else {
            color = 0xffffff;
        }

        let materialT = new THREE.MeshPhongMaterial({
            color: color,
            shading: THREE.FlatShading
        });

        if (true) {
            var triangleAreaHeuristics = 0.1 * ( height * size );
            for (var i = 0; i < textGeo.faces.length; i++) {
                var face = textGeo.faces[i];
                if (face.materialIndex == 1) {
                    for (var j = 0; j < face.vertexNormals.length; j++) {
                        face.vertexNormals[j].z = 0;
                        face.vertexNormals[j].normalize();
                    }
                    var va = textGeo.vertices[face.a];
                    var vb = textGeo.vertices[face.b];
                    var vc = textGeo.vertices[face.c];
                    var s = THREE.GeometryUtils.triangleArea(va, vb, vc);
                    if (s > triangleAreaHeuristics) {
                        for (var j = 0; j < face.vertexNormals.length; j++) {
                            face.vertexNormals[j].copy(face.normal);
                        }
                    }
                }
            }
        }


        textMesh1 = new THREE.Mesh(textGeo, materialT);
        if (type === "press") {
            textMesh1.position.x = Math.random() * 10 - 5;
            textMesh1.position.y = Math.random() * 10 - 5;
            textMesh1.position.z = -10;
            this.group.add(textMesh1);
        } else if (type === "question") {
            this.scene.remove( this.q );
            textMesh1.position.x = -3;
            textMesh1.position.y = 0;
            textMesh1.position.z = -5;
            this.q = textMesh1;
            this.scene.add(this.q);
        }
    }
}

const questions = [
    "test",
    "test2",
    "juggling"
];

const char = {
    32: [" ", " "],
    48: ["0", ""],
    49: ["1", "!"],
    50: ["2", '"'],
    51: ["3", "#"],
    52: ["4", "$"],
    53: ["5", "%"],
    54: ["6", "&"],
    55: ["7", "'"],
    56: ["8", "("],
    57: ["9", ")"],
    59: [":", "+"], // ブラウザ差異あり
    65: ["A", "A"],
    66: ["B", "B"],
    67: ["C", "C"],
    68: ["D", "D"],
    69: ["E", "E"],
    70: ["F", "F"],
    71: ["G", "G"],
    72: ["H", "H"],
    73: ["I", "I"],
    74: ["J", "J"],
    75: ["K", "K"],
    76: ["L", "L"],
    77: ["M", "M"],
    78: ["N", "N"],
    79: ["O", "O"],
    80: ["P", "P"],
    81: ["Q", "Q"],
    82: ["R", "R"],
    83: ["S", "S"],
    84: ["T", "T"],
    85: ["U", "U"],
    86: ["V", "V"],
    87: ["W", "W"],
    88: ["X", "X"],
    89: ["Y", "Y"],
    90: ["Z", "Z"],
    107: [";", "+"], // ブラウザ差異あり
    109: ["-", "="], // ブラウザ差異あり
    186: [":", "*"], // ブラウザ差異あり
    187: [";", "+"], // ブラウザ差異あり
    188: [",", "<"],
    189: ["-", "="], // ブラウザ差異あり
    190: [".", ">"],
    191: ["/", "?"],
    192: ["@", "`"],
    219: ["[", "{"],
    220: ["\\", "|"],
    221: ["]", "}"],
    222: ["^", "~"],
    226: ["\\", "_"]
};

(function() {
    App.room = App.cable.subscriptions.create("RoomChannel", {
        connected: function() {},
        disconnected: function() {},
        received: function(data) {
            return console.log(data);
        },
        key_pressed: function(key) {
            console.log("test");
            return this.perform('keyPressed', {
                key: key
            });
        }
    });

}).call(this);


