import struct
import os

# Gera um arquivo .ico de 32x32 pixels nas cores Dourado e Verde (Tamanduá Dactyla Code)
def create_dactyla_ico(file_path):
    width = 32
    height = 32
    bpp = 32
    
    # Prepara os pixels RGBA
    pixels = bytearray()
    for y in range(height):
        for x in range(width):
            # Círculo verde brilhante com borda dourada
            dx = x - 15.5
            dy = y - 15.5
            dist_sq = dx*dx + dy*dy
            
            if dist_sq <= 100: # Dentro do círculo (Verde Dactyla #10B981)
                r, g, b, a = 16, 185, 129, 255
            elif dist_sq <= 144: # Borda Dourada (#F59E0B)
                r, g, b, a = 245, 158, 11, 255
            else: # Transparente
                r, g, b, a = 0, 0, 0, 0
                
            # Formato BGRA
            pixels.extend([b, g, r, a])
            
    # Inverte as linhas para o formato DIB (bottom-up)
    dib_pixels = bytearray()
    row_bytes = width * 4
    for y in range(height - 1, -1, -1):
        start = y * row_bytes
        dib_pixels.extend(pixels[start:start + row_bytes])

    # Cabeçalho ICO
    ico_header = struct.pack('<HHH', 0, 1, 1) # Reserved, Type (1=ICO), Count (1)
    
    # DIB Header (BITMAPINFOHEADER)
    dib_header = struct.pack('<IIIHHIIIIII', 40, width, height * 2, 1, bpp, 0, len(dib_pixels), 0, 0, 0, 0)
    
    # Directory Entry
    dir_entry = struct.pack('<BBBBHHII', width, height, 0, 0, 1, bpp, len(dib_header) + len(dib_pixels), 6 + 16)
    
    with open(file_path, 'wb') as f:
        f.write(ico_header)
        f.write(dir_entry)
        f.write(dib_header)
        f.write(dib_pixels)

ico_path = os.path.join(os.path.dirname(__file__), 'tamandua.ico')
create_dactyla_ico(ico_path)
print(f"[OK] Icone criado em: {ico_path}")
