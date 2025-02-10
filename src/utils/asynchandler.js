const asynchandler = (fnt) => {
    return (req, res, next) => {
        Promise.resolve(fnt(req, res, next )).catch((error) => next(error));
    }
}


/*Approch 02*/
/*const asynchandler = (fnt) => async (req, res, next) => {
    try {
        await fnt(req, res, next) 
    }catch(error){
        res.status(error.code || 500 ).json({
        success: false,
        message: error.message
    })
    }
}
*/
export { asynchandler }