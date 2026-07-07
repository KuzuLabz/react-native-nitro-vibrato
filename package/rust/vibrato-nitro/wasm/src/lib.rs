use serde::{Deserialize, Serialize};
use vibrato::{Dictionary, SystemDictionaryBuilder, Tokenizer, errors::VibratoError};
use wasm_bindgen::prelude::*;
use std::io::Cursor;

#[derive(Serialize, Deserialize)]
pub struct Token {
    surface: String,
    lex_type: String,
    feature: String,
    word_id: u32,
    // range_char: Range,
    // range_byte: Range,
    left_id: u16,
    right_id: u16,
    word_cost: i16,
    total_cost: i32,
}

#[wasm_bindgen]
pub struct Vibrato {
    tokenizer: Tokenizer,
}

pub fn load_dict(
    dict_data: &[u8],
    user_dict: Option<Box<[u8]>>
) -> Result<Dictionary, VibratoError> {
    let mut dictionary = Dictionary::read(dict_data)?;
    
    if user_dict.is_some() {
        let bytes = user_dict.as_deref().unwrap_or(&[]);
        dictionary = dictionary.reset_user_lexicon_from_reader(Some(bytes))?;
    }
    
    Ok(dictionary)
}

pub fn load_from_textdict_bytes(
    lex_data: &[u8],
    matrix_data: &[u8],
    char_data: &[u8],
    unk_data: &[u8],
    user_dict: Option<Box<[u8]>>
) -> Result<Dictionary, VibratoError> {
    let mut dictionary = SystemDictionaryBuilder::from_readers(
        lex_data,
        matrix_data,
        char_data,
        unk_data,
    )?;

    if user_dict.is_some() {
        let bytes = user_dict.as_deref().unwrap_or(&[]);
        dictionary = dictionary.reset_user_lexicon_from_reader(Some(bytes))?;
    }

    Ok(dictionary)
}

#[wasm_bindgen]
impl Vibrato {
    #[wasm_bindgen(constructor)]
    pub fn new(
        dict_data: &[u8],
        user_dict: Option<Box<[u8]>>,
        ignore_space: Option<bool>,
        max_grouping_len: Option<usize>
    ) -> Result<Vibrato, JsValue> {
        let dictionary = load_dict(dict_data, user_dict);
        // let mut dictionary = Dictionary::read(dict_data)
        // .map_err(|e| JsValue::from_str(&format!("Failed to read dictionary: {}", e)))?;

        // if user_dict.is_some() {
        //     let bytes = user_dict.as_deref().unwrap_or(&[]);
        //     dictionary = dictionary.reset_user_lexicon_from_reader(Some(bytes)).map_err(|e| JsValue::from_str(&format!("Failed to read user dictionary: {}", e)))?;
        // }
        
        let tokenizer = Tokenizer::new(dictionary.unwrap())
            .ignore_space(ignore_space.unwrap_or_default()).map_err(|e| JsValue::from_str(&format!("Failed to read dictionary: {}", e)))?
            .max_grouping_len(max_grouping_len.unwrap_or_default());
        Ok(Self { tokenizer })
    }

    

    #[wasm_bindgen]
    pub fn from_textdict_bytes(
        lex_data: &[u8],
        matrix_data: &[u8],
        char_data: &[u8],
        unk_data: &[u8],
        user_dict: Option<Box<[u8]>>,
        ignore_space: Option<bool>,
        max_grouping_len: Option<usize>
    ) -> Result<Vibrato, JsValue> {
        let dictionary = load_from_textdict_bytes(
            lex_data,
            matrix_data,
            char_data,
            unk_data,
            user_dict
        );
        // let mut dictionary = SystemDictionaryBuilder::from_readers(
        //     lex_data,
        //     matrix_data,
        //     char_data,
        //     unk_data,
        // ).map_err(|e| JsValue::from_str(&format!("Failed to read dictionary: {}", e)))?;

        // if user_dict.is_some() {
        //     let bytes = user_dict.as_deref().unwrap_or(&[]);
        //     dictionary = dictionary.reset_user_lexicon_from_reader(Some(bytes)).map_err(|e| JsValue::from_str(&format!("Failed to read user dictionary: {}", e)))?;
        // }

        let tokenizer = Tokenizer::new(dictionary.unwrap()).ignore_space(ignore_space.unwrap_or_default()).map(|tokenizer| tokenizer.max_grouping_len(max_grouping_len.unwrap_or_default()))
        .map_err(|e| JsValue::from_str(&format!("Failed to read dictionary: {}", e)))?;

        Ok(Self { tokenizer })
    }

    #[wasm_bindgen]
    pub fn compile_dict(
        lex_data: &[u8],
        matrix_data: &[u8],
        char_data: &[u8],
        unk_data: &[u8]
    ) -> Result<Vec<u8>, JsValue> {
        let mut buffer = Cursor::new(Vec::new());
        let dictionary = load_from_textdict_bytes(lex_data, matrix_data, char_data, unk_data, None);

        dictionary.unwrap().write(&mut buffer)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;

        let compiled_data: Vec<u8> = buffer.into_inner();
        Ok(compiled_data)
    }

    #[wasm_bindgen]
    pub fn tokenize(&self, text: &str) -> Result<JsValue, JsValue> {
        let mut worker = self.tokenizer.new_worker();
        worker.reset_sentence(&text);
        worker.tokenize();
        let tokens = worker
            .token_iter()
            .map(|t| Token {
                surface: t.surface().to_string(),
                lex_type: format!("{:?}", t.lex_type()).to_ascii_lowercase(),
                feature: t.feature().to_string(),
                word_id: t.word_idx().word_id,
                // range_char: t.range_char().into(),
                // range_byte: t.range_byte().into(),
                left_id: t.left_id(),
                right_id: t.right_id(),
                word_cost: t.word_cost(),
                total_cost: t.total_cost(),
            })
            .collect::<Vec<_>>();

        serde_wasm_bindgen::to_value(&tokens).map_err(|e| JsValue::from_str(&format!("Failed to return tokens: {}", e)))
    }
}