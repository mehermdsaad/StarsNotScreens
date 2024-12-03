import struct
import math
import json


def parse_star_record(record):
    # Extract star name (bytes 5-14)
    name = record[4:14].decode("ascii").strip()

    # Extract RA (bytes 76-83)
    try:
        ra_hours = float(record[75:77].decode("ascii"))
        ra_minutes = float(record[77:79].decode("ascii"))
        ra_seconds = float(record[79:83].decode("ascii"))

        dec_sign = record[83:84].decode("ascii")
        dec_degrees = float(record[84:86].decode("ascii"))
        dec_minutes = float(record[86:88].decode("ascii"))
        dec_seconds = float(record[88:90].decode("ascii"))

        vmag = float(record[102:107].decode("ascii"))

        ra_hours_total = ra_hours + ra_minutes / 60 + ra_seconds / 3600
        dec_degrees_total = dec_degrees + dec_minutes / 60 + dec_seconds / 3600
        if dec_sign == "-":
            dec_degrees_total = -dec_degrees_total

        theta = (ra_hours_total * 15) * math.pi / 180
        phi = (90 - dec_degrees_total) * math.pi / 180

        # Convert to Cartesian coordinates
        x = math.sin(phi) * math.cos(theta)
        y = math.cos(phi)
        z = math.sin(phi) * math.sin(theta)

        coord = {}

    except Exception:
        ra_hours = 69.42
        ra_seconds = 69.42
        ra_minutes = 69.42
        dec_sign = "_"
        dec_degrees = 69.42
        dec_minutes = 69.42
        dec_seconds = 69.42
        vmag = 69.42

        x = 0
        y = 0
        z = 0

    return {
        "name": name,
        "right_ascension": f"{ra_hours}h {ra_minutes}m {ra_seconds}s",
        "declination": f"{dec_sign}{dec_degrees}d {dec_minutes}' {dec_seconds}\"",
        "apparent_magnitude": vmag,
        "coord": {"x": x, "y": y, "z": z},
    }


# Open and read the file
with open("catalog", "rb") as file:
    # Read the entire file
    data = file.read()

    # Calculate number of records
    record_length = 197
    num_records = len(data) // record_length

    i = 0
    cnt = 0
    # Parse and print first few records
    saved_data = {"stars": []}
    while True:
        # Extract record
        cnt += 1

        record = []
        j = i
        while j < len(data):
            if data[j] == b"\n"[0]:
                break
            j += 1

        record = data[i:j]
        i = j + 1

        print("RECORD", record)

        star_info = parse_star_record(record)

        if (
            star_info["coord"]["x"] == 0
            and star_info["coord"]["y"] == 0
            and star_info["coord"]["z"] == 0
        ):
            continue
        # print(star_info)
        saved_data["stars"].append(star_info)

        if cnt >= 9110:
            break

    print(saved_data)
    # Save the parsed data to a JSON file
    with open("stars.json", "w") as json_file:
        json.dump(saved_data, json_file, indent=4)
