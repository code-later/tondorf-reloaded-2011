class AndisBot < Grasshopper
  
  def think
    if self.shooting?
      puts "thinking and firing"
    else
      # opponent = find_nearest_opponent
      # shoot(opponent)
      puts "thinking about to shoot"
    end
  end
  
  # def shoot(opponent)
  #   turn_to(opponent)
  #   shoot
  # end
  
end

AndisBot.new("localhost:3000", "Andi").join()