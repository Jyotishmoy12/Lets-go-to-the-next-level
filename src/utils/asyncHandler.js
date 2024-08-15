// Define an asyncHandler function that takes a requestHandler as an argument
const asyncHandler = (requestHandler) => {
    // Return a new function that takes Express request, response, and next middleware function as arguments
    return (req, res, next) => {
        // Wrap the execution of requestHandler in a Promise and handle any errors
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

// Export the asyncHandler function for use in other modules
export { asyncHandler }



// const asyncHandler=()=>{}
// const asyncHandler=(func)=>()=>{}
// const asyncHandler=(func)=> async ()=>{}

// const asyncHandler=(fn)=>async(req, res, next)=>{
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//        res.status(error.code || 500).json({
//         success: false,
//         message: error.message
//        })
//     }
// }