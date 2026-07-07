#include "HybridNitroVibrato.hpp"

namespace margelo::nitro::nitrovibrato {
    bool HybridNitroVibrato::getIsInitialized() {
        if (this->tokenizer != nullptr) {
            return true;
        } else {
            return false;
        }
    }

    void HybridNitroVibrato::freeDic() {
        this->tokenizer.reset();
    }

    std::shared_ptr<Promise<void>> HybridNitroVibrato::initialize(const std::string &dictionaryPath,
                                                                  const std::optional<InitializeOptions> &options) {
        return Promise<void>::async([=, this]() {
            auto dict_file = this->readFileFromPath(dictionaryPath);

            if (this->tokenizer != nullptr) {
                this->tokenizer = nullptr;
            }

            bool ignoreSpaceValue = false;
            uintptr_t maxGroupingValue = 0;

            if (options.has_value()) {
                if (options->ignoreSpace.has_value()) {
                    ignoreSpaceValue = options->ignoreSpace.value();
                }
                if (options->maxGroupingLength.has_value()) {
                    maxGroupingValue = static_cast<uintptr_t>(options->maxGroupingLength.value());
                }
            }

            NativeTokenizer* raw_tokenizer = vibrato_create(dict_file.data(), dict_file.size(), &ignoreSpaceValue, &maxGroupingValue);

            this->throwInitError(raw_tokenizer);

            this->tokenizer.reset(raw_tokenizer, [](NativeTokenizer* ptr) {
                if (ptr != nullptr) {
                    vibrato_free_tokenizer(ptr);
                }
            });
        });
    }

    std::shared_ptr<Promise<void>>
    HybridNitroVibrato::initializeFromBytes(const std::shared_ptr<ArrayBuffer> &bytes,
                                            const std::optional<InitializeOptions> &options) {
        std::shared_ptr<ArrayBuffer> safeBuffer = bytes->isOwner() 
            ? bytes 
            : ArrayBuffer::copy(bytes);

        return Promise<void>::async([=, this]() {
            if (this->tokenizer != nullptr) {
                this->tokenizer = nullptr;
            }

            bool ignoreSpaceValue = false;
            uintptr_t maxGroupingValue = 0;

            if (options.has_value()) {
                if (options->ignoreSpace.has_value()) {
                    ignoreSpaceValue = options->ignoreSpace.value();
                }
                if (options->maxGroupingLength.has_value()) {
                    maxGroupingValue = static_cast<uintptr_t>(options->maxGroupingLength.value());
                }
            }

            NativeTokenizer* raw_tokenizer = vibrato_create(safeBuffer->data(), safeBuffer->size(), &ignoreSpaceValue, &maxGroupingValue);

            this->throwInitError(raw_tokenizer);

            this->tokenizer.reset(raw_tokenizer, [](NativeTokenizer* ptr) {
                if (ptr != nullptr) {
                    vibrato_free_tokenizer(ptr);
                }
            });
        });
    }

    std::shared_ptr<Promise<void>>
    HybridNitroVibrato::initializeFromTextdict(const FilePaths &files,
                                               const std::optional<InitializeOptions> &options) {
        return Promise<void>::async([=, this]() {
            auto lexBytes = this->readFileFromPath(files.lexPath);
            auto matrixBytes = this->readFileFromPath(files.matrixPath);
            auto charBytes = this->readFileFromPath(files.charPath);
            auto unkBytes = this->readFileFromPath(files.unkPath);

            bool ignoreSpaceValue = false;
            uintptr_t maxGroupingValue = 0;

            if (options.has_value()) {
                if (options->ignoreSpace.has_value()) {
                    ignoreSpaceValue = options->ignoreSpace.value();
                }
                if (options->maxGroupingLength.has_value()) {
                    maxGroupingValue = static_cast<uintptr_t>(options->maxGroupingLength.value());
                }
            }

            NativeTokenizer* raw_tokenizer = vibrato_create_from_textdict(
                lexBytes.data(), lexBytes.size(),
                matrixBytes.data(), matrixBytes.size(),
                charBytes.data(), charBytes.size(),
                unkBytes.data(), unkBytes.size(),
                &ignoreSpaceValue, &maxGroupingValue
            );

            this->throwInitError(raw_tokenizer);

            this->tokenizer.reset(raw_tokenizer, [](NativeTokenizer* ptr) {
                if (ptr != nullptr) {
                    vibrato_free_tokenizer(ptr);
                }
            });
        });
    }

    std::shared_ptr<Promise<void>>
    HybridNitroVibrato::initializeFromTextdictBytes(const FileBytes &files,
                                                    const std::optional<InitializeOptions> &options) {
        return Promise<void>::async([=, this]() {
            if (!files.lexBytes || !files.matrixBytes || !files.charBytes || !files.unkBytes) {
                throw std::runtime_error("Invalid or null input buffers passed to initializeFromTextdictBytes");
            }

            bool ignoreSpaceValue = false;
            uintptr_t maxGroupingValue = 0;

            if (options.has_value()) {
                if (options->ignoreSpace.has_value()) {
                    ignoreSpaceValue = options->ignoreSpace.value();
                }
                if (options->maxGroupingLength.has_value()) {
                    maxGroupingValue = static_cast<uintptr_t>(options->maxGroupingLength.value());
                }
            }
            
            uint8_t* lex_ptr = files.lexBytes->data();
            size_t lex_sz    = files.lexBytes->size();
            
            uint8_t* mat_ptr = files.matrixBytes->data();
            size_t mat_sz    = files.matrixBytes->size();
            
            uint8_t* chr_ptr = files.charBytes->data();
            size_t chr_sz    = files.charBytes->size();
            
            uint8_t* unk_ptr = files.unkBytes->data();
            size_t unk_sz    = files.unkBytes->size();

            NativeTokenizer* raw_tokenizer = vibrato_create_from_textdict(
                lex_ptr, lex_sz,
                mat_ptr, mat_sz,
                chr_ptr, chr_sz,
                unk_ptr, unk_sz,
                &ignoreSpaceValue, &maxGroupingValue
            );

            this->throwInitError(raw_tokenizer);

            this->tokenizer.reset(raw_tokenizer, [](NativeTokenizer* ptr) {
                if (ptr != nullptr) {
                    vibrato_free_tokenizer(ptr);
                }
            });
        });
    }

    std::shared_ptr<Promise<std::vector<Token>>>
    HybridNitroVibrato::tokenize(const std::string &text) {
        return Promise<std::vector<Token>>::async([=, this]() {
            std::vector<Token> result_tokens;

            auto raw_tokens = vibrato_tokenize(this->tokenizer.get(), text.c_str());

            if (raw_tokens.data == nullptr || raw_tokens.len == 0) {
                throw std::runtime_error("Failed to tokenize");
            }

            result_tokens.reserve(raw_tokens.len);

            for (uintptr_t i = 0; i < raw_tokens.len; ++i) {
                TokenC& raw_token = raw_tokens.data[i];
                Token token;

                token.surface  = raw_token.surface  ? std::string(raw_token.surface) : "";
                token.lexType = raw_token.lex_type ? std::string(raw_token.lex_type) : "";
                if (raw_token.features) {
                    std::string feature_str(raw_token.features);
                    std::stringstream ss(feature_str);
                    std::string segment;

                    while (std::getline(ss, segment, ',')) {
                        token.features.push_back(segment);
                    }
                }

                // Copy integer metrics
                token.wordId   = raw_token.word_id;
                token.leftId   = raw_token.left_id;
                token.rightId  = raw_token.right_id;
                token.wordCost = raw_token.word_cost;

                // Convert the int32_t total_cost to a double
                token.totalCost = static_cast<double>(raw_token.total_cost);

                result_tokens.push_back(token);
            }

            vibrato_free_token_array(raw_tokens);
            return result_tokens;
        });
        
    }

    std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>
    HybridNitroVibrato::compileDictBytes(const FileBytes &files) {
        return Promise<std::shared_ptr<ArrayBuffer>>::async([=]() {
            if (!files.lexBytes || !files.matrixBytes || !files.charBytes || !files.unkBytes) {
                throw std::runtime_error("Invalid or null input buffers passed to compileDict");
            }

            VibratoBuffer *rust_buffer = vibrato_compile_dict(
                    files.lexBytes->data(), files.lexBytes->size(),
                    files.matrixBytes->data(), files.matrixBytes->size(),
                    files.charBytes->data(), files.charBytes->size(),
                    files.unkBytes->data(), files.unkBytes->size()
            );

            if (rust_buffer == nullptr) {
                char *raw_error = vibrato_get_last_error();
                std::string error_msg(raw_error);
                vibrato_free_string(raw_error);
                throw std::runtime_error(error_msg);
            }

            auto js_buffer = nitro::ArrayBuffer::allocate(rust_buffer->length);

            std::memcpy(js_buffer->data(), rust_buffer->data_ptr, rust_buffer->length);

            vibrato_free_buffer(rust_buffer);

            return js_buffer;
        });
    }

    std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>>
    HybridNitroVibrato::compileDict(const FilePaths &files) {
        return Promise<std::shared_ptr<ArrayBuffer>>::async([=, this]() {
           auto lexBytes = this->readFileFromPath(files.lexPath);
            auto matrixBytes = this->readFileFromPath(files.matrixPath);
            auto charBytes = this->readFileFromPath(files.charPath);
            auto unkBytes = this->readFileFromPath(files.unkPath);

            VibratoBuffer *rust_buffer = vibrato_compile_dict(
                    lexBytes.data(), lexBytes.size(),
                    matrixBytes.data(), matrixBytes.size(),
                    charBytes.data(), charBytes.size(),
                    unkBytes.data(), unkBytes.size()
            );

            if (rust_buffer == nullptr) {
                char *raw_error = vibrato_get_last_error();
                std::string error_msg(raw_error);
                vibrato_free_string(raw_error);
                throw std::runtime_error(error_msg);
            }

            auto js_buffer = nitro::ArrayBuffer::allocate(rust_buffer->length);

            std::memcpy(js_buffer->data(), rust_buffer->data_ptr, rust_buffer->length);

            vibrato_free_buffer(rust_buffer);

            return js_buffer;
        });
    }
}