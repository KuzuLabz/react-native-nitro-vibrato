#include "HybridNitroVibratoSpec.hpp"
#include <fstream>
#include <stdexcept>
#include "vibrato.h"
#include <filesystem>

namespace fs = std::filesystem;

 namespace margelo::nitro::nitrovibrato {
   class HybridNitroVibrato: public HybridNitroVibratoSpec {
   private:
       std::shared_ptr<NativeTokenizer> tokenizer;

    public:
     bool getIsInitialized() override;

    // methods
   public:
     HybridNitroVibrato(): HybridObject(TAG) {}
     std::shared_ptr<Promise<void>> initialize(const std::string& dictionaryPath, const std::optional<InitializeOptions>& options) override;
     std::shared_ptr<Promise<void>> initializeFromBytes(const std::shared_ptr<ArrayBuffer>& bytes, const std::optional<InitializeOptions>& options) override;
     std::shared_ptr<Promise<void>> initializeFromTextdict(const FilePaths& files, const std::optional<InitializeOptions>& options) override;
     std::shared_ptr<Promise<void>> initializeFromTextdictBytes(const FileBytes& files, const std::optional<InitializeOptions>& options) override;
     std::shared_ptr<Promise<std::vector<Token>>> tokenize(const std::string& text) override;
     std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> compileDict(const FilePaths& files) override;
     std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> compileDictBytes(const FileBytes& files) override;
     void freeDic() override;

   public:
        void validate_file_path(std::string uri) {
            fs::path filePath(uri);
            if (!fs::exists(filePath) || !fs::is_directory(filePath)) {
                std::runtime_error("File/Directory path does not exist: " + uri);
                // throw or set promise rejection
            }
        };

        std::string clean_file_path(std::string uri) {
            validate_file_path(uri);
            
            const std::string prefix = "file://";
            
            if (uri.substr(0, prefix.size()) == prefix) {
                return std::string(uri.substr(prefix.size()));
            }
            
            return std::string(uri);
        };
       std::vector<uint8_t> readFileFromPath(const std::string& filePath) {
            auto path = clean_file_path(filePath);
           // 1. Open the file stream at the end (ios::ate) to instantly check the file size
           std::ifstream file(path, std::ios::binary | std::ios::ate);
    
            if (!file.is_open()) {
                throw std::runtime_error("Unable to open file!");
            }

            // Get the file size and allocate memory
            std::streamsize size = file.tellg();
            std::vector<uint8_t> buffer(size);

            // Seek back to the beginning and read the data
            file.seekg(0, std::ios::beg);
            if (!file.read(reinterpret_cast<char*>(buffer.data()), size)) {
                return {}; // Return empty vector if read fails
            }

            return buffer;
       }

       void throwInitError(NativeTokenizer* raw_tokenizer) {
            if (raw_tokenizer == nullptr) {
                char *raw_error = vibrato_get_last_error();
                std::string error_msg(raw_error);
                vibrato_free_string(raw_error);
                throw std::runtime_error(error_msg);
            }
       }
   };
 }