import argparse
from PIL import Image
import random


def generate_bacon_group_image(binary_string, output_path, cols=13, figure_size=(250, 380),
                               overlap_x=0.0, overlap_y=0.35, odd_row_offset=0.0):
    bits = list(map(int, binary_string))
    # Calculate number of rows needed with alternating row lengths
    bits_remaining = len(bits)
    row_capacities = []
    toggle = True  # Start with full-length row
    while bits_remaining > 0:
        row_capacity = cols if toggle else cols - 1
        row_capacities.append(min(bits_remaining, row_capacity))
        bits_remaining -= row_capacity
        toggle = not toggle


    # Load all the figure variations into memory
    front_variants = [
        Image.open("images/front_1.png").resize(figure_size),
        Image.open("images/front_2.png").resize(figure_size),
        Image.open("images/front_3.png").resize(figure_size)
    ]

    side_variants = [
        Image.open("images/side_1.png").resize(figure_size),
        Image.open("images/side_2.png").resize(figure_size),
        Image.open("images/side_3.png").resize(figure_size)
    ]

    fig_width, fig_height = figure_size
    cell_w = int(fig_width * (1 - overlap_x))
    cell_h = int(fig_height * (1 - overlap_y))
    canvas_width = (cols + 1) * cell_w
    canvas_height = (len(row_capacities) + 1) * cell_h

    # Create sepia gradient backgroun
    background = Image.open("images/background.png").resize((canvas_width, canvas_height)).convert("RGB")

    # Composite figures
    composite = background.convert("RGBA")
    bit_index = 0
    for row, row_capacity in enumerate(row_capacities):
        for col in range(row_capacity):
            bit = bits[bit_index]
            bit_index += 1

            total_row_width = row_capacity * cell_w
            x_offset = ((canvas_width - total_row_width) // 2) - (fig_width // 3)

            x = x_offset + col * cell_w
            if row % 2 == 1:
                x += int(cell_w * odd_row_offset)
            y = int(row * cell_h) + 20

            chosen_figure = random.choice(front_variants) if bit == 0 else random.choice(side_variants)
            composite.alpha_composite(chosen_figure, (x, y))

    # Save result
    composite.save(output_path)
    print(f"Saved group image to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate a Bacon cipher group photo from full-body figures.")
    parser.add_argument("--binary", type=str, required=True, help="Bacon cipher bits (e.g., 1000110010...)")
    parser.add_argument("--output", type=str, default="bacon_cipher_output.png", help="Output file name")
    parser.add_argument("--cols", type=int, default=13, help="Number of columns")
    parser.add_argument("--width", type=int, default=500, help="Figure width")
    parser.add_argument("--height", type=int, default=760, help="Figure height")
    parser.add_argument("--overlap_x", type=float, default=0.75, help="Horizontal overlap (0.0 to 0.9)")
    parser.add_argument("--overlap_y", type=float, default=0.8, help="Vertical overlap (0.0 to 0.9)")
    parser.add_argument("--offset", type=float, default=0.4, help="Horizontal offset for odd rows (0.0 to 1.0)")
    args = parser.parse_args()

    if args.cols < 3:
        print("Error: Column count must be at least 3 to support staggered layout.")
        return

    generate_bacon_group_image(
        binary_string=args.binary,
        output_path=args.output,
        cols=args.cols,
        figure_size=(args.width, args.height),
        overlap_x=args.overlap_x,
        overlap_y=args.overlap_y,
        odd_row_offset=args.offset
    )


if __name__ == "__main__":
    main()
