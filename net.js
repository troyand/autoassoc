var net = {
    alphabetSize: 10,
    hiddenLayerSize: 5,
    initialWeightAbsMax: 0.2,
    imgWidth: 3,
    imgHeight: 5,
    eta: 0.4,
    sigmoid: function(x){
        return 1/(1 + Math.exp(-x));
    },
    init: function(){
        this.weights1 = [];//from layer 0 to layer 1
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            this.weights1[i] = [];
            for(var j = 0; j < this.hiddenLayerSize; j++){
                this.weights1[i][j] = this.initialWeightAbsMax - 2*this.initialWeightAbsMax*Math.random();
            }
        }
        this.weights2 = [];//from layer 1 to layer 2
        for(var i = 0; i < this.hiddenLayerSize; i++){
            this.weights2[i] = [];
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                this.weights2[i][j] = this.initialWeightAbsMax - 2*this.initialWeightAbsMax*Math.random();
            }
        }
        $('<canvas/>', {
            id: 'out'
        }).attr('width', net.imgWidth).attr('height', net.imgHeight).appendTo($('body'));
    },
    test: function(vector){
        var out1 = [];
        for(var i = 0; i < this.hiddenLayerSize; i++){
            out1[i] = 0;
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                out1[i] += this.weights1[j][i] * vector[j];
            }
            out1[i] = this.sigmoid(out1[i]);
        }
        console.log(out1);
        var out2 = [];
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            out2[i] = 0;
            for(var j = 0; j < this.hiddenLayerSize; j++){
                out2[i] += this.weights2[j][i] * out1[j];
            }
            out2[i] = this.sigmoid(out2[i]);
        }
        var context = document.getElementById('out').getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.clearRect(0, 0, this.imgWidth, this.imgHeight);
        for( var i = 0; i < this.imgWidth*this.imgHeight; i++){
            if(out2[i] > 0.5){
                context.fillRect(i % this.imgWidth, Math.floor(i/this.imgWidth), 1, 1);
            }
        }
        var deltas = [];
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            deltas[i] = (vector[i] - out2[i]) * out2[i] * (1 - out2[i]);
            for(var j = 0; j < this.hiddenLayerSize; j++){
                this.weights2[j][i] += deltas[i] * out1[j] * this.eta;
            }
        }
        for(var i = 0; i < this.hiddenLayerSize; i++){
            var delta = 0;
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                delta += deltas[j] * this.weights2[i][j];
            }
            delta *= out1[i] * (1 - out1[i]);
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                this.weights1[j][i] += delta * vector[j] * this.eta;
            }
        }
    }
};


function makeImage(n, img){
    img.src = n+'.png';
    img.onload = function(){
        var canvas = $('<canvas/>', {
            id: 'number'+n,
        }).attr('width', net.imgWidth).attr('height', net.imgHeight);
        $('body').append(canvas);
        var context = document.getElementById('number'+n).getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.drawImage(img, 0, 0, net.imgWidth, net.imgHeight);
        canvas.click(function(){
            //console.log(n);
            var data = context.getImageData(0, 0, net.imgWidth, net.imgHeight).data;
            var matrix = [];
            var vector = []
            for(var h = 0; h < net.imgHeight; h++){
                matrix[h]=[];
                for(var w = 0; w < net.imgWidth; w++){
                    vector[h*net.imgWidth + w] = 1 - context.getImageData(w, h, 1, 1).data[0] / 255;
                    matrix[h][w] = 1 - context.getImageData(w, h, 1, 1).data[0] / 255;
                }
            }
            //console.log(matrix);
            net.test(vector);
        });
    };
}


$(document).ready(function(){
    for(var i=0; i < net.alphabetSize; i++){
        makeImage(i, new Image);
    }
    net.init();
    $('#out').click(function(){
        for(var j = 0; j < net.alphabetSize; j++){
            $('#number' + j).click();
        }
    });
});
