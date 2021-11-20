require 'json'
require 'gtk3'

class Taula
  attr_accessor :taula
  @files 
  @columnes
  def crearTaula(raw_data)
    #puts raw_data
    @files=0
    @columnes=0
    
    json = JSON.parse(raw_data)
    resp = json["result"]
    puts resp
   @files = resp.size
    if @files!=0
    @columnes = resp[0].size
    puts @files
    puts @columnes
    #date = resp[0].key?("date")
    @taula = Gtk::Table.new(@files, @columnes, true)
    i=0
     
     loop do
     
        if i==@files
            break
        end
        labels = crearLabels(resp[i])
        puts labels
        afegirFila(labels, i)
        puts labels 
        puts "labels"
        i=i+1
      end
      return @taula
  end
  return nil
  end
  
  def crearLabels(hash)
    labels=[]
    hash.each do |key, value|
      if key=="date"
        labels.push(Gtk::Label.new(value[0,10]))
        puts value
      else
        if key =="mark" 
        labels.push(Gtk::Label.new(value.to_s))
        puts  value
        else
        
        labels.push(Gtk::Label.new(value))
        puts value
        end
      end
    end
    return labels
  end
  

  def afegirFila(labels, fila) 
    i =0
    loop do
    
    if i==@columnes 
        break
    end
    
      @taula.attach(labels[i],i,i+1,fila, fila+1, nil, nil, 3, 3)
      i=i+1

  end
  
end
  def numFiles
      return @files
end

end



