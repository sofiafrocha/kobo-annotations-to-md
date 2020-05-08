# Get all the annotations
1. Connect your Kobo to your computer
2. Copy the `.kobo/BookReader.sqlite` file from the Kobo to this folder
3. Install dependencies by running `npm install`
4. Run the script by running `nodejs index.js`
5. The files with your annotations will be on the `highlights` folder

# Get annotations from a `.annot` file
1. Copy your `.annot` file to this folder and rename it `annotations.annot`
2. Install the dependency by running `npm install xml2json`
3. Run the script by running nodejs `nodejs from_file.js`
4. Your annotations will be in the `annotations.md` file