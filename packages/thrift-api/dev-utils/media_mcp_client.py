import asyncio
from fastmcp import Client
from media_generator_server import media_generator_mcp_server


async def main():
    """
    Connects to the ImagenImageGeneratorServer and calls the generate_and_save_image tool
    for a single test image.
    """
    client = None
    try:
        print("Attempting to connect to MediaGeneratorServer...")
        client = Client(media_generator_mcp_server)
        print("Successfully connected to MediaGeneratorServer.")

        prompt = "A futuristic city at sunset with flying cars"
        filename = "test_image.png"

        print(f"Calling 'generate_and_save_image' with prompt: '{prompt}' and filename: '{filename}'")
        result = await client.call_tool("generate_and_save_image", {prompt:prompt, filename:filename})
        print(f"Server response: {result}")

    except Exception as e:
        print(f"Error connecting to or interacting with MCP server: {e}")
    finally:
        if client:
            print("Closing client connection.")
            await client.close()

if __name__ == "__main__":
    asyncio.run(main())

