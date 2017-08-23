require 'csv'

@top = '<!DOCTYPE html><html><head>
<link rel="stylesheet" type="text/css" href="./www/css/index.css" />
<link rel="stylesheet" type="text/css" href="./www/css/chatbot.css" />
<link rel="stylesheet" type="text/css" href="./www/css/ionicons.css" />
<script type="text/javascript" src="./www/js/polyfills.js"></script>
<script type="text/javascript" src="./www/js/jquery-2.2.4.min.js"></script>
<title>RHS Chatbot</title><style>.date { font-size: 1em; } .location { font-size:0.7em; } .chatBotChatEntry { display: block; }</style></head><body>'
@bottom = '</body></html>'

@fileN = 1

def create_image_folder(csv_file)
  fname = csv_file.sub("logs/", "").sub('.csv', '')
  `mkdir logs/#{fname}`
  return fname
end

def convert(csv_files)
  for csv_file in csv_files
    begin
      img_count = 0
      imageFolder = create_image_folder(csv_file)
      
      csv = CSV.open(csv_file, "r", quote_char: "|")
      html_file = csv_file.sub(".csv", ".html")
      
      html = File.open(html_file, "w")
      html.puts @top
      html.puts "<h1>#{html_file}</h1>"
      html.puts "<h2>File #{@fileN} of #{csv_files.size}</h2>"
      html.puts "<div id=\"chatContainer\"><div id=\"chatBotHistory\">"

      i = 0
      csv.each do |row|
        i+=1
        next if i.eql?(1)

        html.puts "<div class=\"chatBotChatEntry #{row[2]}\">"
        html.puts "<span class=\"origin\">#{row[3]}</span>"
        
        if row[1].include?("<img")
          img_count +=1
          html.puts "Image number #{img_count}<br/>"
          html.puts row[1].sub("<img", "").sub("/>", "")
          html.puts "<img alt=\"image #{img_count}\" src=\"#{imageFolder}/#{img_count}.jpg\" />"
        else
          html.puts row[1]
        end

        html.puts "<p class=\"date\">#{row[0]}</p>"
        html.puts "<p class=\"location\">#{row[4]}, #{row[5]}</p>"
        html.puts "</div>"
      end

      html.puts "</div></div>"
      html.puts @bottom
      @fileN += 1
    rescue => e
      STDERR.puts "[ERROR] #{csv_file} #{e}"
      exit 1
    end
  end
end


def understand_images(csv_files)
  for csv_file in csv_files
    begin
      img_count = 0
      csv = CSV.open(csv_file, "r", quote_char: "|")
      i = 0
      csv.each do |row|
        i+=1
        next if i.eql?(1)
        if row[1].include?("<img")
          img_count +=1
        end
      end
      puts "File #{@fileN} (#{csv_file}) has #{img_count} images"
      @fileN += 1
    rescue => e
      STDERR.puts "[ERROR] #{csv_file} #{e}"
      exit 1
    end
  end
end

csv_files = Dir["logs/*.csv"].sort
puts csv_files.join(" ")
puts csv_files.size

#convert(csv_files)
understand_images(csv_files)