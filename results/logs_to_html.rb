require 'csv'

csv_files = Dir["logs/*.csv"]

@top = '<!DOCTYPE html><html><head>
<link rel="stylesheet" type="text/css" href="./www/css/index.css" />
<link rel="stylesheet" type="text/css" href="./www/css/chatbot.css" />
<link rel="stylesheet" type="text/css" href="./www/css/ionicons.css" />
<script type="text/javascript" src="./www/js/polyfills.js"></script>
<script type="text/javascript" src="./www/js/jquery-2.2.4.min.js"></script>
<title>RHS Chatbot</title><style>.chatBotChatEntry { display: block; }</style></head><body>'
@bottom = '</body></html>'

def convert(csv_file)
  begin
    csv = CSV.open(csv_file, "r", quote_char: "|")
    html_file = csv_file.sub(".csv", ".html")
    
    html = File.open(html_file, "w")
    html.puts @top
    html.puts "<div id=\"chatContainer\"><div id=\"chatBotHistory\">"

    i = 0
    csv.each do |row|
      i+=1
      next if i.eql?(1)
      html.puts "<div class=\"chatBotChatEntry #{row[2]}\">"
      html.puts "<span class=\"origin\">#{row[3]}</span>"
      html.puts "#{row[1]}"
      html.puts "</div>"
    end
    html.puts "</div></div>"
    html.puts @bottom
  rescue => e
    STDERR.puts "[ERROR] #{csv_file} #{e}"
    exit 1
  end
end

csv_files.each {|f| convert(f) }