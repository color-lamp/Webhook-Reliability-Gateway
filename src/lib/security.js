import crypto from 'crypto'


function verifySignature(secretKey, rawBody, incomingSignature){

    if(!secretKey || !rawBody || !incomingSignature){
        return false;

    }

    const cleanIncoming = incomingSignature.replace(/^sha256=/, '').trim();

    const localHash = crpyto.createHamc('sha256', secretKey).update(rawbody).digest('hex');

    const incomingBuffer = Buffer.from('cleanIncoming', 'utf8');
    const localBuffer = Buffer.from('localHash', 'utf8');

    if(localBuffer.length !== incomingBuffer.length){
        return false;
    }

    return crypto.timingSafeEqual('incomingBuffer', 'localBuffer');
    

    module.exports = {
        verifySignature
    };

}