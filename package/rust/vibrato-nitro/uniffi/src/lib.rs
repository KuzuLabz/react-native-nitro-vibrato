use serde::Serialize;
use std::cell::RefCell;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::slice;
use std::io::Cursor;
use vibrato::{Dictionary, SystemDictionaryBuilder, Tokenizer};

pub struct NativeTokenizer {
    tokenizer: Tokenizer,
}

#[repr(C)]
pub struct VibratoBuffer {
    pub data_ptr: *mut u8,
    pub length: usize,
}

#[repr(C)]
pub struct TokenC {
    surface: *mut c_char,
    lex_type: *mut c_char,
    features: *mut c_char,
    word_id: u32,
    left_id: u16,
    right_id: u16,
    word_cost: i16,
    total_cost: i32,
}
#[repr(C)]
pub struct TokenCArray {
    data: *mut TokenC,
    len: usize,
}

#[derive(Serialize)]
pub struct Token {
    surface: String,
    lex_type: String,
    feature: String,
    word_id: u32,
    left_id: u16,
    right_id: u16,
    word_cost: i16,
    total_cost: i32,
}

thread_local! {
    static LAST_ERROR: RefCell<String> = RefCell::new(String::new());
}

// Helper to update the last error message
fn set_last_error(err: String) {
    LAST_ERROR.with(|prev| {
        *prev.borrow_mut() = err;
    });
}

// Expose a function to fetch the last error from C++
#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_get_last_error() -> *mut c_char {
    let mut err_str = String::new();
    LAST_ERROR.with(|prev| {
        err_str = prev.borrow().clone();
    });
    CString::new(err_str).unwrap().into_raw()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_create(
    bytes_ptr: *const u8,
    length: usize,
    ignore_space: *const bool,
    max_grouping_len: *const usize,
) -> *mut NativeTokenizer {
    if bytes_ptr.is_null() || length == 0 {
        return std::ptr::null_mut();
    }

    let opt_ignore_space = if ignore_space.is_null() { false } else { unsafe { *ignore_space } };
    let opt_max_grouping_len = if max_grouping_len.is_null() { 0 } else { unsafe { *max_grouping_len } };

    // Safely reconstruct the byte slice from the C pointer and length
    let bytes = unsafe { slice::from_raw_parts(bytes_ptr, length) };

    // Read the dictionary straight from memory
    let dict = match Dictionary::read(bytes) {
        Ok(d) => d,
        Err(_) => return std::ptr::null_mut(),
    };

    let result = Tokenizer::new(dict)
    .ignore_space(opt_ignore_space)
    .map(|tokenizer| tokenizer.max_grouping_len(opt_max_grouping_len));
    
    match result {
        Ok(tokenizer) => Box::into_raw(Box::new(NativeTokenizer { tokenizer })),
        Err(e) => {
            // Save the exact error message to our thread-local store
            set_last_error(format!("Vibrato init failed: {}", e));
            std::ptr::null_mut()
        }
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_create_from_textdict(
    lex_ptr: *const u8, lex_len: usize,
    matrix_ptr: *const u8, matrix_len: usize,
    char_ptr: *const u8, char_len: usize,
    unk_ptr: *const u8, unk_len: usize,
    ignore_space: *const bool,
    max_grouping_len: *const usize,
) -> *mut NativeTokenizer {
    // Reconstruct byte slices safely from raw pointers
    let lex_data = unsafe { slice::from_raw_parts(lex_ptr, lex_len) };
    let matrix_data = unsafe { slice::from_raw_parts(matrix_ptr, matrix_len) };
    let char_data = unsafe { slice::from_raw_parts(char_ptr, char_len) };
    let unk_data = unsafe { slice::from_raw_parts(unk_ptr, unk_len) };

    // Extract optional parameters from pointers
    let opt_ignore_space = if ignore_space.is_null() { false } else { unsafe { *ignore_space } };
    let opt_max_grouping_len = if max_grouping_len.is_null() { 0 } else { unsafe { *max_grouping_len } };

    // Build the system dictionary using your identical WASM implementation logic
    let result = SystemDictionaryBuilder::from_readers(
        lex_data,
        matrix_data,
        char_data,
        unk_data,
    )
    .and_then(|dict| Tokenizer::new(dict).ignore_space(opt_ignore_space))
    .map(|tokenizer| tokenizer.max_grouping_len(opt_max_grouping_len));

    match result {
        Ok(tokenizer) => Box::into_raw(Box::new(NativeTokenizer { tokenizer })),
        Err(e) => {
            // Save the exact error message to our thread-local store
            set_last_error(format!("Vibrato init failed: {}", e));
            std::ptr::null_mut()
        }
    }
}

// #[unsafe(no_mangle)]
// pub unsafe extern "C" fn vibrato_create(
//     dict_path: *const c_char, 
//     ignore_space: *const bool,
//     max_grouping_len: *const usize
// ) -> *mut NativeTokenizer {
//     let c_str = unsafe { CStr::from_ptr(dict_path) };
//     let path_str = match c_str.to_str() {
//         Ok(s) => s,
//         Err(_) => return std::ptr::null_mut(),
//     };

//     // In native mobile, we can read straight from the local file system!
//     let file = match std::fs::File::open(path_str) {
//         Ok(f) => f,
//         Err(_) => return std::ptr::null_mut(),
//     };

//     let dict = match Dictionary::read(file) {
//         Ok(d) => d,
//         Err(_) => return std::ptr::null_mut(),
//     };

//     // Extract optional parameters from pointers
//     let opt_ignore_space = if ignore_space.is_null() { false } else { unsafe { *ignore_space } };
//     let opt_max_grouping_len = if max_grouping_len.is_null() { 0 } else { unsafe { *max_grouping_len } };

//     let result = Tokenizer::new(dict)
//     .ignore_space(opt_ignore_space)
//     .map(|tokenizer| tokenizer.max_grouping_len(opt_max_grouping_len));
    
//     match result {
//         Ok(tokenizer) => Box::into_raw(Box::new(NativeTokenizer { tokenizer })),
//         Err(e) => {
//             // Save the exact error message to our thread-local store
//             set_last_error(format!("Vibrato init failed: {}", e));
//             std::ptr::null_mut()
//         }
//     }
// }

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_compile_dict(
    lex_ptr: *const u8, lex_len: usize,
    matrix_ptr: *const u8, matrix_len: usize,
    char_ptr: *const u8, char_len: usize,
    unk_ptr: *const u8, unk_len: usize,
) -> *mut VibratoBuffer {
    let lex_data = unsafe { slice::from_raw_parts(lex_ptr, lex_len) };
    let matrix_data = unsafe { slice::from_raw_parts(matrix_ptr, matrix_len) };
    let char_data = unsafe { slice::from_raw_parts(char_ptr, char_len) };
    let unk_data = unsafe { slice::from_raw_parts(unk_ptr, unk_len) };

    let mut buffer = Cursor::new(Vec::new());
    let dictionary = match SystemDictionaryBuilder::from_readers(
        lex_data,
        matrix_data,
        char_data,
        unk_data,
    ) {
        Ok(dict) => dict,
        Err(e) => {
            set_last_error(format!("Dict load failed: {}", e));
            return std::ptr::null_mut();
        }
    };

    if let Err(e) = dictionary.write(&mut buffer) {
        set_last_error(format!("Dict compile write failed: {}", e));
        return std::ptr::null_mut();
    }

    let mut compiled_data = buffer.into_inner();
    compiled_data.shrink_to_fit();

    // Box the buffer data so we can send it safely over the boundary
    let length = compiled_data.len();
    let data_ptr = compiled_data.as_mut_ptr();
    std::mem::forget(compiled_data); // Prevent Rust from deallocating the vector data right now

    Box::into_raw(Box::new(VibratoBuffer { data_ptr, length }))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_tokenize(
    tokenizer_ptr: *mut NativeTokenizer,
    text: *const c_char,
) -> TokenCArray {
    let tokenizer = unsafe { &*tokenizer_ptr };
    let c_str = unsafe { CStr::from_ptr(text).to_str().unwrap() };
    
    let mut worker = tokenizer.tokenizer.new_worker();
    worker.reset_sentence(c_str);
    worker.tokenize();

    let mut tokens: Vec<TokenC> = worker.token_iter().map(|t| {
        let surface = CString::new(t.surface()).unwrap().into_raw();
        let lex_type = CString::new(format!("{:?}", t.lex_type())).unwrap().into_raw();
        let features = CString::new(t.feature()).unwrap().into_raw();

        TokenC {
            surface,
            lex_type,
            features,
            word_id: t.word_idx().word_id,
            left_id: t.left_id(),
            right_id: t.right_id(),
            word_cost: t.word_cost(),
            total_cost: t.total_cost(),
        }
        // surface: t.surface().to_string(),
        // lex_type: format!("{:?}", t.lex_type()),
        // feature: t.feature().to_string(),
        // word_id: t.word_idx().word_id,
        // // range_char: FfiRange { start: t.range_char().start, end: t.range_char().end },
        // // range_byte: FfiRange { start: t.range_byte().start, end: t.range_byte().end },
        // left_id: t.left_id(),
        // right_id: t.right_id(),
        // word_cost: t.word_cost(),
        // total_cost: t.total_cost(),
    }).collect();

    tokens.shrink_to_fit();
    let len = tokens.len();
    let data = tokens.as_mut_ptr();
    std::mem::forget(tokens); 

    TokenCArray { data, len }

}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_free_tokenizer(tokenizer_ptr: *mut NativeTokenizer) {
    if !tokenizer_ptr.is_null() {
        // Reconstruct the Box and let it go out of scope to trigger the destructor
        unsafe { let _ = Box::from_raw(tokenizer_ptr); } 
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        let _ = unsafe { CString::from_raw(ptr) };
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_free_buffer(buffer_ptr: *mut VibratoBuffer) {
    if !buffer_ptr.is_null() {
        let boxed_buffer = unsafe { Box::from_raw(buffer_ptr) };
        // Reconstruct the original Vec from the pointer and length to let RAII drop it safely
        if !boxed_buffer.data_ptr.is_null() && boxed_buffer.length > 0 {
            let _ = unsafe { Vec::from_raw_parts(boxed_buffer.data_ptr, boxed_buffer.length, boxed_buffer.length) };
        }
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vibrato_free_token_array(array: TokenCArray) {
    if array.data.is_null() {
        return;
    }
    
    // Reconstruct the vector to trigger Rust's drop mechanics
    let tokens = unsafe { Vec::from_raw_parts(array.data, array.len, array.len) };
    
    // Explicitly free the nested C strings inside each Token
    for token in tokens {
        if !token.surface.is_null() { unsafe { let _ = CString::from_raw(token.surface); } }
        if !token.lex_type.is_null() { unsafe { let _ = CString::from_raw(token.lex_type); } }
        if !token.features.is_null() { unsafe { let _ = CString::from_raw(token.features); } }
    }
}