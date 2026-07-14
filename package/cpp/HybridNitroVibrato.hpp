#include "HybridNitroVibratoSpec.hpp"
#include <fstream>
#include <stdexcept>
#include "vibrato.h"
#include <filesystem>

namespace fs = std::filesystem;

template <class... Ts>
struct overloaded : Ts...
{
    using Ts::operator()...;
};
template <class... Ts>
overloaded(Ts...) -> overloaded<Ts...>;

namespace margelo::nitro::nitrovibrato
{
    class HybridNitroVibrato : public HybridNitroVibratoSpec
    {
    private:
        std::shared_ptr<NativeTokenizer> tokenizer;

    public:
        bool getIsInitialized() override;

        // methods
    public:
        HybridNitroVibrato() : HybridObject(TAG) {}
        std::shared_ptr<Promise<void>> initialize(const std::string &dictionaryPath, const std::optional<std::variant<std::shared_ptr<ArrayBuffer>, std::string>> &userDict, const std::optional<InitializeOptions> &options) override;
        std::shared_ptr<Promise<void>> initializeFromBytes(const std::shared_ptr<ArrayBuffer> &bytes, const std::optional<std::variant<std::shared_ptr<ArrayBuffer>, std::string>> &userDict, const std::optional<InitializeOptions> &options) override;
        std::shared_ptr<Promise<void>> initializeFromTextdict(const FilePaths &files, const std::optional<std::variant<std::shared_ptr<ArrayBuffer>, std::string>> &userDict, const std::optional<InitializeOptions> &options) override;
        std::shared_ptr<Promise<void>> initializeFromTextdictBytes(const FileBytes &files, const std::optional<std::variant<std::shared_ptr<ArrayBuffer>, std::string>> &userDict, const std::optional<InitializeOptions> &options) override;
        std::shared_ptr<Promise<std::vector<Token>>> tokenize(const std::string &text) override;
        std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> compileDict(const FilePaths &files) override;
        std::shared_ptr<Promise<std::shared_ptr<ArrayBuffer>>> compileDictBytes(const FileBytes &files) override;
        void freeDic() override;

    public:
        void validate_file_path(std::string uri)
        {
            fs::path filePath(uri);
            if (!fs::exists(filePath) || !fs::is_directory(filePath))
            {
                std::runtime_error("File/Directory path does not exist: " + uri);
                // throw or set promise rejection
            }
        };

        std::string clean_file_path(std::string uri)
        {
            validate_file_path(uri);

            const std::string prefix = "file://";

            if (uri.substr(0, prefix.size()) == prefix)
            {
                return std::string(uri.substr(prefix.size()));
            }

            return std::string(uri);
        };
        std::vector<uint8_t> readFileFromPath(const std::string &filePath)
        {
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
            if (!file.read(reinterpret_cast<char *>(buffer.data()), size)) {
                return {}; // Return empty vector if read fails
            }

            return buffer;
        }

        std::vector<uint8_t> getUserDict(const std::optional<std::variant<std::shared_ptr<ArrayBuffer>, std::string>> &userDict)
        {
            std::vector<uint8_t> user_dict;

            if (!userDict.has_value()) {
                return user_dict;
            };

            std::visit(overloaded{[](const std::shared_ptr<ArrayBuffer> &buffer) {
                    std::shared_ptr<ArrayBuffer> safeBuffer = buffer->isOwner() 
                        ? buffer 
                        : ArrayBuffer::copy(buffer);
                    
                    uint8_t* rawData = buffer->data();
                    size_t size = buffer->size();

                    std::vector<uint8_t> bufferVec(rawData, rawData + size);
                    return bufferVec;
                },
                [this](const std::string &path) {
                    return readFileFromPath(path);
                }},
                userDict.value()
            );

            return user_dict;
        }

        void throwInitError(NativeTokenizer *raw_tokenizer)
        {
            if (raw_tokenizer == nullptr)
            {
                char *raw_error = vibrato_get_last_error();
                std::string error_msg(raw_error);
                vibrato_free_string(raw_error);
                throw std::runtime_error(error_msg);
            }
        }
    };
}