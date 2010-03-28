var net = {
    alphabetSize: 10,
    hiddenLayerSize: 7,
    initialWeightAbsMax: 0.2,
    imgWidth: 20,
    imgHeight: 30,
    eta: 0.05,
    vectors: [],//vectors of input image data
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
        $('<div/>', {
            text: 'Output'
        }).appendTo($('body'));
        $('<canvas/>', {
            id: 'out'
        }).attr('width', net.imgWidth).attr('height', net.imgHeight).appendTo($('body'));
    },
    compress: function(vector, n){
        var out1 = [];
        for(var i = 0; i < this.hiddenLayerSize; i++){
            out1[i] = 0;
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                out1[i] += this.weights1[j][i] * vector[j];
            }
            if(out1[i] >= 0){
                out1[i] = 1;
            } else {
                out1[i] = -1;
            }
        }
        var compressed = '';
        for(var i in out1){
            if(out1[i]==1){
                compressed += '1';
            } else {
                compressed += '0';
            }
        }
        $('#compressed').val(compressed);
    },
    decompress: function(out1){
        var out2 = [];
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            out2[i] = 0;
            for(var j = 0; j < this.hiddenLayerSize; j++){
                out2[i] += this.weights2[j][i] * out1[j];
            }
            if(out2[i] >= 0){
                out2[i] = 1;
            } else {
                out2[i] = -1;
            }
        }
        var context = document.getElementById('out').getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.clearRect(0, 0, this.imgWidth, this.imgHeight);
        for( var i = 0; i < this.imgWidth*this.imgHeight; i++){
            if(out2[i]==1){
                context.fillRect(i % this.imgWidth, Math.floor(i/this.imgWidth), 1, 1);
            }
        }
    },
    test: function(vector, n){
        var out1 = [];
        for(var i = 0; i < this.hiddenLayerSize; i++){
            out1[i] = 0;
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                out1[i] += this.weights1[j][i] * vector[j];
            }
            if(out1[i] >= 0){
                out1[i] = 1;
            } else {
                out1[i] = -1;
            }
        }
        //console.log(out1);
        var out2 = [];
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            out2[i] = 0;
            for(var j = 0; j < this.hiddenLayerSize; j++){
                out2[i] += this.weights2[j][i] * out1[j];
            }
            if(out2[i] >= 0){
                out2[i] = 1;
            } else {
                out2[i] = -1;
            }
        }
        var deltas1 = [];
        for(var i = 0; i < this.hiddenLayerSize; i++){
            deltas1[i] = 0;
        }
        var deltas2 = [];
        var errors = 0; //number of errors
        for(var i = 0; i < this.imgWidth*this.imgHeight; i++){
            deltas2[i] = vector[i] - out2[i];
            if(vector[i] != out2[i]){
                errors++;
            }
            for(var j = 0; j < this.hiddenLayerSize; j++){
                deltas1[j] += deltas2[i] * this.weights2[j][i];
                this.weights2[j][i] += deltas2[i] * out1[j] * this.eta;
            }
        }
        $('#error'+n).text(Math.round(100*errors/(this.imgWidth*this.imgHeight)) + '%');
        for(var i = 0; i < this.hiddenLayerSize; i++){
            for(var j = 0; j < this.imgWidth*this.imgHeight; j++){
                this.weights1[j][i] += deltas1[i] * vector[j] * this.eta;
            }
        }
        //console.log(this.weights1);
        //console.log(this.weights2);
    }
};


function makeImage(n, img){
    img.src = n+'b.png';
    img.onload = function(){
        var canvas = $('<canvas/>', {
            id: 'number'+n,
        }).attr('width', net.imgWidth).attr('height', net.imgHeight);
        $('body').append(canvas);
        $('<span/>', {
            id: 'error'+n,
            text: '0%'
        }).appendTo($('body'));
        var context = document.getElementById('number'+n).getContext('2d');
        context.mozImageSmoothingEnabled = false;
        context.drawImage(img, 0, 0, net.imgWidth, net.imgHeight);
        net.vectors[n]=[];
        for(var h = 0; h < net.imgHeight; h++){
            for(var w = 0; w < net.imgWidth; w++){
                net.vectors[n][h*net.imgWidth + w] = 1 - 2*context.getImageData(w, h, 1, 1).data[0] / 255;
            }
        }
        canvas.click(function(){
            //console.log(n);
            //console.log(matrix);
            net.compress(net.vectors[n], n);
        });
    };
}


$(document).ready(function(){
    for(var i=0; i < net.alphabetSize; i++){
        makeImage(i, new Image);
    }
    $("#init").click(function(){
        net.eta = $("#eta").val();
        net.hiddenLayerSize = $("#hidden").val();
        net.init();
    });
    $('#train').click(function(){
        for(var i =0; i < $("#epochs").val(); i++){
            for(var j = 0; j < net.alphabetSize; j++){
                net.test(net.vectors[j], j);
            }
        }
    });
    $('#decompress').click(function(){
        var compressed = $('#compressed').val();
        var out2 = [];
        for(var i in compressed){
            if(compressed[i] == '1'){
                out2[i] = 1;
            } else {
                out2[i] = -1;
            }
        }
        net.decompress(out2);
    });
});
